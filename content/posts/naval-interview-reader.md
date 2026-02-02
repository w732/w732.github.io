---
title: "Naval Ravikant Interview Reader — with Built-in Vocabulary Lookup"
date: 2026-02-02
tags: ["English", "Vocabulary", "Tools", "Naval Ravikant"]
---

An interactive reader for the *"44 Harsh Truths About Human Nature"* interview between Naval Ravikant and Chris Williamson (Modern Wisdom Podcast), with a built-in vocabulary lookup powered by my personal word bank.

## Features

- **Dialogue format** with color-coded speakers (Naval in purple, Chris in blue)
- **612 vocabulary words** highlighted with dashed underlines — click any word to see its definition
- **Bilingual definitions** — English by default, toggle to Chinese (中文) with one click
- **Text-to-speech** — hear the pronunciation of any word via the Web Speech API
- **Dark reading theme** optimized for long-form reading
- **Ad-free** — sponsor segments from the original transcript are automatically removed
- **Mobile responsive** — works on phone screens

## How It Works

The page is a single self-contained HTML file with no external dependencies. During the build step, a script:

1. Parses ~4,500 words from my vocabulary lists (with star ratings and Chinese definitions)
2. Generates morphological variants (plurals, past tense, -ing, -ly, etc.) to catch inflected forms
3. Fetches English definitions from the Wiktionary API (cached locally for fast rebuilds)
4. Scans the interview transcript and wraps every matched word in a clickable highlight
5. Outputs a single HTML file with all CSS and JS inlined

## Try It Out

**[Open Naval Interview Reader](/tools/naval-interview.html)**

Click on any underlined word to see its definition, star level, and memory tip. Use the EN / 中文 toggle at the top to switch languages.
