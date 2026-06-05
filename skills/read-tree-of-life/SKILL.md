---
name: read-tree-of-life
description: >
  Navigate the Kabbalistic Tree of Life (Etz Chaim) — explore the ten
  sephirot, twenty-two paths, four worlds, and three pillars. Covers
  correspondences, contemplative exercises, and structural analysis. Use
  when exploring a sephira's attributes and divine names, studying structural
  relationships between sephirot, learning the four worlds (Atzilut through
  Assiah), tracing a path's Hebrew letter and tarot attributions, or using
  the Tree as a symbolic map for understanding a concept or system.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: advanced
  language: natural
  tags: esoteric, kabbalah, tree-of-life, sephirot, paths, contemplation
---

# Read Tree of Life

Navigate the Kabbalistic Tree of Life (Etz Chaim) — locating sephirot, tracing paths, identifying correspondences, and conducting contemplative exercises within the structure of the four worlds and three pillars.

## When to Use

- You want to explore a specific sephira's attributes, divine names, and correspondences
- You need to understand the structural relationships between sephirot (paths, triads, pillars)
- You are studying the four worlds (Atzilut, Briah, Yetzirah, Assiah) and how they layer the Tree
- You want a contemplative exercise grounded in a specific location on the Tree
- You are tracing a path between two sephirot and need its Hebrew letter, tarot, and elemental attributions
- You need the Tree as a map for understanding a concept, process, or system through Kabbalistic symbolism

## Inputs

- **Required**: A sephira, path, or structural element to explore (e.g., "Tiferet," "the path between Hod and Yesod," "the Pillar of Severity")
- **Optional**: Tradition preference (classical Jewish Kabbalah, Hermetic Qabalah, comparative)
- **Optional**: Depth level (overview, detailed study, contemplative exercise)
- **Optional**: Current context or question the Tree should illuminate

## Procedure

### Step 1: Identify the Sephira or Path to Explore

Determine the specific location on the Tree and its basic identity.

```
The Ten Sephirot:
┌────┬──────────────┬───────────────┬─────────┬──────────────────┐
│ #  │ Name         │ Translation   │ Pillar  │ World            │
├────┼──────────────┼───────────────┼─────────┼──────────────────┤
│  1 │ Keter        │ Crown         │ Balance │ Atzilut          │
│  2 │ Chokmah      │ Wisdom        │ Mercy   │ Atzilut          │
│  3 │ Binah        │ Understanding │ Severity│ Atzilut          │
│  — │ Da'at        │ Knowledge     │ Balance │ (Hidden/Abyss)   │
│  4 │ Chesed       │ Mercy         │ Mercy   │ Briah            │
│  5 │ Gevurah      │ Severity      │ Severity│ Briah            │
│  6 │ Tiferet      │ Beauty        │ Balance │ Briah/Yetzirah   │
│  7 │ Netzach      │ Victory       │ Mercy   │ Yetzirah         │
│  8 │ Hod          │ Splendor      │ Severity│ Yetzirah         │
│  9 │ Yesod        │ Foundation    │ Balance │ Yetzirah         │
│ 10 │ Malkut       │ Kingdom       │ Balance │ Assiah           │
└────┴──────────────┴───────────────┴─────────┴──────────────────┘

Tree Structure (schematic):

            Keter (1)
           /    |    \
     Binah (3)  |  Chokmah (2)
         \  [Da'at]  /
          \   |   /
     Gevurah (5)---Chesed (4)
           \  |  /
          Tiferet (6)
           /  |  \
       Hod (8)---Netzach (7)
           \  |  /
          Yesod (9)
              |
         Malkut (10)

Three Pillars:
- Pillar of Severity (left): Binah, Gevurah, Hod — restriction, form, judgment
- Pillar of Mercy (right): Chokmah, Chesed, Netzach — expansion, force, compassion
- Pillar of Balance (middle): Keter, Tiferet, Yesod, Malkut — equilibrium, integration
```

1. Name the sephira, path, or structural element the user wants to explore
2. Locate it on the Tree diagram — which pillar, which world, which triad
3. Note its number (sephirot are 1-10; paths are traditionally numbered 11-32)
4. Identify the tradition context: classical (Cordovero, Luria) or Hermetic (Golden Dawn)

**Expected:** A clear identification of where on the Tree the exploration begins. The user can mentally locate the element within the overall structure.

**On failure:** If the user's request is vague (e.g., "tell me about the Tree"), start with an overview of the three pillars and ten sephirot, then ask which area to explore in depth.

### Step 2: Study the Sephira's Attributes

For the identified sephira, present its full attribute set from traditional sources.

```
Sephira Attribute Template:
┌────────────────────┬──────────────────────────────────────────┐
│ Attribute          │ Content                                  │
├────────────────────┼──────────────────────────────────────────┤
│ Name (Hebrew)      │ [Hebrew transliteration]                 │
│ Translation        │ [English meaning]                        │
│ Number             │ [1-10]                                   │
│ Divine Name        │ [Name of God associated with sephira]    │
│ Archangel          │ [Angelic ruler]                          │
│ Angelic Order      │ [Choir of angels]                        │
│ Planet/Sphere      │ [Astrological attribution]               │
│ Element            │ [Elemental correspondence, if applicable]│
│ Color (Atzilut)    │ [King Scale color — Hermetic tradition]  │
│ Color (Briah)      │ [Queen Scale color]                      │
│ Virtue             │ [Positive quality when balanced]         │
│ Vice               │ [Quality when imbalanced or excessive]   │
│ Body               │ [Physical correspondence]                │
│ Tarot              │ [Major/minor arcana associations]        │
│ Incense/Perfume    │ [Traditional correspondence]             │
│ Symbol             │ [Primary symbolic image]                 │
└────────────────────┴──────────────────────────────────────────┘

Note: Attributions vary between traditions. Classical Jewish Kabbalah
does not use tarot or color scales (these are Hermetic additions).
Always note the tradition source for each attribution.
```

1. Fill in the attribute template for the selected sephira
2. Note the divine name and its significance (each sephira has a unique Name of God)
3. Identify the archangel and angelic order associated with the sephira
4. Record planetary and color correspondences (noting tradition: Jewish vs. Hermetic)
5. State the virtue (balanced expression) and vice (excess or deficiency)

**Expected:** A complete attribute profile for the sephira. The user understands what the sephira represents, how it is addressed in practice, and what correspondences link it to other symbolic systems.

**On failure:** If the user is overwhelmed by correspondences, present only name, translation, number, pillar, and one-sentence summary. Add detail incrementally on request.

### Step 3: Examine Connecting Paths

Trace the paths that connect the sephira to its neighbors, noting the Hebrew letter, tarot attribution, and elemental/planetary/zodiacal correspondence of each path.

```
The Twenty-Two Paths (Hermetic/Golden Dawn Attribution):
┌──────┬────────────┬────────────┬──────────────────────┬─────────────┐
│ Path │ Letter     │ From → To  │ Attribution          │ Tarot       │
├──────┼────────────┼────────────┼──────────────────────┼─────────────┤
│  11  │ Aleph      │ Keter→Chok │ Air (Mother)         │ 0 Fool      │
│  12  │ Beth       │ Keter→Bina │ Mercury              │ I Magician  │
│  13  │ Gimel      │ Keter→Tif  │ Moon                 │ II Priestess│
│  14  │ Daleth     │ Chok→Binah │ Venus                │ III Empress │
│  15  │ Heh        │ Chok→Tif   │ Aries                │ IV Emperor  │
│  16  │ Vav        │ Chok→Ches  │ Taurus               │ V Hieroph.  │
│  17  │ Zayin      │ Bina→Tif   │ Gemini               │ VI Lovers   │
│  18  │ Cheth      │ Bina→Gevu  │ Cancer               │ VII Chariot │
│  19  │ Teth       │ Ches→Gevu  │ Leo                  │ VIII Streng.│
│  20  │ Yod        │ Ches→Tif   │ Virgo                │ IX Hermit   │
│  21  │ Kaph       │ Ches→Netz  │ Jupiter              │ X Wheel     │
│  22  │ Lamed      │ Gevu→Tif   │ Libra                │ XI Justice  │
│  23  │ Mem        │ Gevu→Hod   │ Water (Mother)       │ XII Hanged  │
│  24  │ Nun        │ Tif→Netz   │ Scorpio              │ XIII Death  │
│  25  │ Samekh     │ Tif→Yesod  │ Sagittarius          │ XIV Temper. │
│  26  │ Ayin       │ Tif→Hod    │ Capricorn            │ XV Devil    │
│  27  │ Peh        │ Netz→Hod   │ Mars                 │ XVI Tower   │
│  28  │ Tzadi      │ Netz→Yesod │ Aquarius             │ XVII Star   │
│  29  │ Qoph       │ Netz→Malk  │ Pisces               │ XVIII Moon  │
│  30  │ Resh       │ Hod→Yesod  │ Sun                  │ XIX Sun     │
│  31  │ Shin       │ Hod→Malkut │ Fire (Mother)        │ XX Judgm.   │
│  32  │ Tav        │ Yesod→Malk │ Saturn/Earth         │ XXI World   │
└──────┴────────────┴────────────┴──────────────────────┴─────────────┘

Note: Path attributions above follow the Golden Dawn system. The Gra
(Vilna Gaon) system and other Jewish authorities differ significantly
in path assignments. Always note which system is being used.
```

1. List all paths connecting to the sephira under study
2. For each path, note: Hebrew letter, direction (from/to), and correspondence
3. Identify which paths cross the Abyss (between Supernals and lower sephirot) — these are significant thresholds
4. Note Hermetic tarot attributions separately from Jewish Kabbalistic content
5. Observe the pattern: which sephirot does this one communicate with most directly?

**Expected:** The user sees the sephira in context — not isolated but connected to its neighbors through specific paths, each carrying its own symbolic weight.

**On failure:** If path attributions are confusing, focus on the sephira's direct neighbors (which sephirot it connects to) without detailing individual path letters. Add letter attributions when the user is ready.

### Step 4: Locate Within the Four Worlds

Place the sephira or path within the four-world framework to understand its level of manifestation.

```
The Four Worlds (Olamot):

ATZILUT (Emanation) — World of Archetypes:
  Sephirot: Keter, Chokmah, Binah
  Nature: Divine will, pure emanation, undifferentiated
  Experience: Unity, source, the Ein Sof's first self-expression
  Soul level: Yechidah (unique essence) and Chayah (life force)

BRIAH (Creation) — World of Thrones:
  Sephirot: Chesed, Gevurah, Tiferet
  Nature: Creative intellect, archangelic, first differentiation
  Experience: Understanding, moral discernment, vision
  Soul level: Neshamah (divine soul, breath of God)

YETZIRAH (Formation) — World of Angels:
  Sephirot: Netzach, Hod, Yesod
  Nature: Emotional/astral, angelic, formative patterns
  Experience: Feelings, imagination, dreams, astral perception
  Soul level: Ruach (spirit, intellectual soul)

ASSIAH (Action) — World of Making:
  Sephirot: Malkut (and the physical universe)
  Nature: Material, elemental, the manifest world
  Experience: Sensory reality, embodied life, physical action
  Soul level: Nephesh (animal soul, vital force)

Key Principle: Every sephira exists in ALL four worlds simultaneously.
The "world" assignment above indicates where each sephira's PRIMARY
influence is felt, but Tiferet-of-Atzilut is different from
Tiferet-of-Assiah — same position, different level of reality.
```

1. Identify which world the sephira primarily operates in
2. Note the soul level (Yechidah, Chayah, Neshamah, Ruach, Nephesh) associated with that world
3. Explain how the sephira's quality manifests differently at each world level
4. If studying a path, note whether it stays within one world or crosses a boundary

**Expected:** The user understands that the Tree is not flat but layered — the same structure repeats at four levels of reality, and the sephira under study has a specific "home world" with expressions at all levels.

**On failure:** If the four-worlds framework is too abstract, simplify: Atzilut = divine, Briah = intellectual, Yetzirah = emotional, Assiah = physical. Ask which level the user wants to focus on.

### Step 5: Contemplative Exercise

Guide a meditation or contemplation grounded in the specific sephira or path.

1. Set the context: review the sephira's core quality in one sentence
2. Suggest a posture and breathing pattern (simple: seated, eyes closed, natural breath)
3. Offer a visualization: imagine the sephira as a sphere of its associated color, located at its body correspondence point
4. Provide a contemplative question tied to the sephira's virtue/vice:
   - Chesed: "Where do I give freely? Where do I give to avoid discomfort?"
   - Gevurah: "Where do I set necessary boundaries? Where does my severity harm?"
   - Tiferet: "Where is beauty in my life? Where am I hiding from harmony?"
   - (Adapt for each sephira)
5. Close with a brief chant or affirmation using the sephira's divine name (silently or aloud)
6. Return to ordinary awareness with one concrete insight or intention

**Expected:** The user has moved from intellectual study to experiential engagement with the sephira. The contemplative exercise grounds abstract symbolism in personal reflection.

**On failure:** If meditation feels forced or artificial, replace with journaling: write for 5 minutes about how the sephira's quality appears in your current life. Written reflection achieves similar integration through a different mode.

## Validation

- [ ] The specific sephira or path was identified and located on the Tree (pillar, world, triad)
- [ ] Core attributes were presented (name, number, divine name, archangel, correspondences)
- [ ] Connecting paths were traced with their Hebrew letter attributions
- [ ] The four-worlds context was addressed (which world, which soul level)
- [ ] A contemplative exercise or reflective prompt was offered
- [ ] Tradition sources were noted where attributions differ (Jewish vs. Hermetic)

## Common Pitfalls

- **Conflating traditions**: The Golden Dawn's path attributions differ from the Gra's and from Ari's (Isaac Luria). Always specify which system is in use
- **Treating the Tree as static**: The Tree is dynamic — sephirot interact, paths carry energy between them. Present it as a living system, not a filing cabinet
- **Skipping Da'at**: The "hidden" sephira (Da'at/Knowledge) sits between the Supernal Triad and the lower seven. It is not a sephira in the same sense but functions as a gateway across the Abyss
- **Over-relying on correspondences**: Tables of correspondences are maps, not the territory. They aid contemplation but should not replace direct engagement with the sephira's quality
- **Ignoring the negative**: Each sephira has a vice (qliphotic shell) as well as a virtue. Presenting only positive attributes gives an incomplete picture
- **Rushing to advanced material**: The Tree's structure is deceptively simple and endlessly deep. Ensure basic orientation (ten sephirot, three pillars) before introducing paths, worlds, and advanced theosophy

## Related Skills

- `apply-gematria` — Compute numerical values of divine names and sephirotic titles for deeper analysis
- `study-hebrew-letters` — Each path carries a Hebrew letter; understanding the letter deepens understanding of the path
- `meditate` — General meditation framework that supports the contemplative exercises in this skill
- `practice-viriditas` — Hildegardian nature contemplation shares structural parallels with Kabbalistic meditation on the natural world
