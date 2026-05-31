use std::io;
use std::path::Path;
use std::time::Duration;

use crossterm::event::{self, KeyCode, KeyEventKind, KeyModifiers};
use crossterm::execute;
use crossterm::terminal::{
    disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen,
};
use ratatui::backend::CrosstermBackend;
use ratatui::Terminal;

use crate::content::registry::Registries;
use crate::error::Result;
use crate::fire::FireState;
use crate::screens::{cover, spellbook};

/// Frame interval while the fire is animating or settling (~15 fps).
const ANIMATION_TICK: Duration = Duration::from_millis(66);
/// Poll deadline when nothing is animating — long enough to stay responsive to
/// resize/quit without spinning the CPU on an idle (e.g. SSH) session.
const IDLE_POLL: Duration = Duration::from_secs(3600);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Screen {
    Cover,
    Spellbook,
}

pub struct App {
    pub screen: Screen,
    pub registries: Registries,
    pub spellbook: spellbook::State,
    pub fire: FireState,
    pub needs_redraw: bool,
    pub should_quit: bool,
}

impl App {
    pub fn new(root: Option<&Path>, animate: bool) -> Result<Self> {
        let registries = crate::content::registry::load(root)?;
        let mut spellbook = spellbook::State::new(&registries, root);
        spellbook.load_bookmarks(crate::state::load().bookmarks);
        Ok(Self {
            screen: Screen::Cover,
            registries,
            spellbook,
            fire: FireState::new(animate),
            needs_redraw: true,
            should_quit: false,
        })
    }

    /// Flare the reading light and request a redraw — call after any reader
    /// action that should be reflected on screen.
    pub fn touched(&mut self) {
        self.fire.bump();
        self.needs_redraw = true;
    }

    /// Persist bookmarks if they changed this session (best-effort).
    fn persist(&self) {
        if !self.spellbook.bookmarks_dirty {
            return;
        }
        let _ = crate::state::save(&crate::state::PersistentState {
            bookmarks: self.spellbook.export_bookmarks(),
            schema_version: crate::state::SCHEMA_VERSION,
            ..Default::default()
        });
    }
}

pub fn run_tui(root: Option<&Path>, animate: bool) -> Result<()> {
    let mut app = App::new(root, animate)?;
    let mut terminal = setup_terminal()?;
    let result = event_loop(&mut terminal, &mut app);
    teardown_terminal(&mut terminal)?;
    app.persist();
    result
}

fn setup_terminal() -> Result<Terminal<CrosstermBackend<io::Stdout>>> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen)?;
    Ok(Terminal::new(CrosstermBackend::new(stdout))?)
}

fn teardown_terminal(terminal: &mut Terminal<CrosstermBackend<io::Stdout>>) -> Result<()> {
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen)?;
    terminal.show_cursor()?;
    Ok(())
}

fn event_loop(terminal: &mut Terminal<CrosstermBackend<io::Stdout>>, app: &mut App) -> Result<()> {
    while !app.should_quit {
        if app.needs_redraw {
            terminal.draw(|frame| draw(frame, app))?;
            app.needs_redraw = false;
        }

        let timeout = if app.fire.needs_ticks() {
            ANIMATION_TICK
        } else {
            IDLE_POLL
        };

        if event::poll(timeout)? {
            match event::read()? {
                event::Event::Key(key) if key.kind == KeyEventKind::Press => {
                    handle_key(app, key.code, key.modifiers);
                }
                event::Event::Resize(_, _) => app.needs_redraw = true,
                _ => {}
            }
        } else if app.fire.needs_ticks() {
            // The poll deadline elapsed without input: advance the animation.
            app.fire.advance();
            app.needs_redraw = true;
        }
    }
    Ok(())
}

fn draw(frame: &mut ratatui::Frame<'_>, app: &mut App) {
    match app.screen {
        Screen::Cover => cover::draw(frame, app),
        Screen::Spellbook => spellbook::draw(frame, app),
    }
}

fn handle_key(app: &mut App, code: KeyCode, mods: KeyModifiers) {
    match (code, mods) {
        (KeyCode::Char('q'), _) => app.should_quit = true,
        (KeyCode::Char('c'), KeyModifiers::CONTROL) => app.should_quit = true,
        _ => {
            // Per-screen: the cover opens the book on any key; the spellbook
            // handles volume switching (Tab/[/]/1-4), navigation, and search.
            match app.screen {
                Screen::Cover => cover::handle_key(app, code, mods),
                Screen::Spellbook => spellbook::handle_key(app, code, mods),
            }
            app.touched();
        }
    }
}
