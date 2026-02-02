---
title: "Naval Ravikant Interview Reader — with Built-in SAT Vocabulary Lookup"
date: 2026-02-01
tags: ["English", "SAT", "Vocabulary", "Tools", "Naval Ravikant"]
---

An interactive reader for the *"44 Harsh Truths About Human Nature"* interview between Naval Ravikant and Chris Williamson (Modern Wisdom Podcast), with a built-in vocabulary lookup designed for SAT and standardized test preparation.

## Why This Exists

Reading authentic English content is one of the most effective ways to build vocabulary for the SAT and similar standardized tests. But constantly switching between a reader and a dictionary breaks the flow.

This tool solves that by embedding an SAT-focused word bank directly into the interview transcript. Every test-relevant word is highlighted in context — click it and you instantly see its definition, without leaving the page.

## The Word Bank

The vocabulary comes from two curated sources totaling **~4,500 base words**:

- **SAT High-Frequency Words** — extracted from official College Board materials and past exams, ranked by actual test appearance frequency. Each word carries a frequency score (e.g., *"convention"* appeared 631 times across SAT passages, *"hypothesis"* 121 times). These are the words that show up again and again on test day.
- **Contextual Conversation Words** — additional academic and conversational vocabulary commonly tested in reading comprehension and writing sections, organized into three priority tiers.

The build process generates morphological variants (plurals, past tense, -ing, -ly, etc.) from these base words, expanding coverage to **~57,000 lookup entries** so that inflected forms like *"hypotheses"*, *"conventional"*, or *"emphasizing"* are all recognized.

In this single interview, **612 unique words** from the word bank appear naturally in Naval's conversation — covering topics like philosophy, game theory, wealth, status, and human psychology. That's real SAT vocabulary used in real intellectual discourse, not isolated flashcard drilling.

## Features

- **612 SAT-relevant words highlighted** — dashed underlines mark every word from the test-prep word bank
- **Click for instant definitions** — tap any highlighted word to see its meaning, star rating, and memory tip
- **Bilingual definitions** — English by default (sourced from Wiktionary), toggle to Chinese (中文) with one click
- **Star ratings** — ★★★ marks the highest-priority, most frequently tested words
- **Text-to-speech** — hear the pronunciation via the Web Speech API
- **Dialogue format** — color-coded speakers (Naval in purple, Chris in blue) for easy reading
- **Dark reading theme** — optimized for extended reading sessions
- **Ad-free** — sponsor segments from the original transcript are automatically removed
- **Mobile responsive** — works on phone screens
- **Fully offline** — single HTML file, no server or internet needed after download

## Try It Out

**[Open Naval Interview Reader](/tools/naval-interview.html)**

Click on any underlined word to see its definition, star level, and memory tip. Use the **EN / 中文** toggle at the top to switch definition languages.

## How It Was Built

The page is a single self-contained HTML file with no external dependencies. A Node.js build script:

1. Parses ~4,500 words from the SAT frequency list and conversation word bank
2. Generates morphological variants to catch all inflected forms in running text
3. Fetches English definitions from the Wiktionary API (cached locally for fast rebuilds)
4. Scans the interview transcript and wraps every matched word in a clickable `<span>`
5. Outputs a single HTML file with all CSS and JS inlined — ready to open in any browser
