use std::io;
use std::path::Path;
use std::time::{Duration, Instant};

use crossterm::event::{self, KeyCode, KeyEventKind, KeyModifiers};
use crossterm::execute;
use crossterm::terminal::{
    disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen,
};
use ratatui::backend::CrosstermBackend;
use ratatui::Terminal;

use crate::content::registry::Registries;
use crate::error::Result;
use crate::screens::{campfire, spellbook};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Screen {
    Campfire,
    Spellbook,
}

pub struct App {
    pub screen: Screen,
    pub registries: Registries,
    pub spellbook: spellbook::State,
    pub campfire_tick: u64,
    pub last_render: Instant,
    pub should_quit: bool,
}

impl App {
    pub fn new(root: Option<&Path>) -> Result<Self> {
        let registries = crate::content::registry::load(root)?;
        let spellbook = spellbook::State::from_registries(&registries);
        Ok(Self {
            screen: Screen::Campfire,
            registries,
            spellbook,
            campfire_tick: 0,
            last_render: Instant::now(),
            should_quit: false,
        })
    }
}

pub fn run_tui(root: Option<&Path>) -> Result<()> {
    let mut app = App::new(root)?;
    let mut terminal = setup_terminal()?;
    let result = event_loop(&mut terminal, &mut app);
    teardown_terminal(&mut terminal)?;
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

fn event_loop(
    terminal: &mut Terminal<CrosstermBackend<io::Stdout>>,
    app: &mut App,
) -> Result<()> {
    while !app.should_quit {
        terminal.draw(|frame| draw(frame, app))?;
        if event::poll(Duration::from_millis(200))? {
            if let event::Event::Key(key) = event::read()? {
                if key.kind == KeyEventKind::Press {
                    handle_key(app, key.code, key.modifiers);
                }
            }
        }
    }
    Ok(())
}

fn draw(frame: &mut ratatui::Frame<'_>, app: &mut App) {
    match app.screen {
        Screen::Campfire => campfire::draw(frame, app),
        Screen::Spellbook => spellbook::draw(frame, app),
    }
}

fn handle_key(app: &mut App, code: KeyCode, mods: KeyModifiers) {
    match (code, mods) {
        (KeyCode::Char('q'), _) => app.should_quit = true,
        (KeyCode::Char('c'), KeyModifiers::CONTROL) => app.should_quit = true,
        (KeyCode::Tab, _) => {
            app.screen = match app.screen {
                Screen::Campfire => Screen::Spellbook,
                Screen::Spellbook => Screen::Campfire,
            };
        }
        _ => match app.screen {
            Screen::Campfire => campfire::handle_key(app, code, mods),
            Screen::Spellbook => spellbook::handle_key(app, code, mods),
        },
    }
}
