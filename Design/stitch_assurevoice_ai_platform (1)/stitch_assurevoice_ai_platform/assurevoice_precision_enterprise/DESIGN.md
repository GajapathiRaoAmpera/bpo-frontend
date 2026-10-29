---
name: AssureVoice Precision Enterprise
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434751'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737782'
  outline-variant: '#c3c6d3'
  surface-tint: '#315cab'
  primary: '#00377d'
  on-primary: '#ffffff'
  primary-container: '#1f4e9c'
  on-primary-container: '#aac3ff'
  inverse-primary: '#aec6ff'
  secondary: '#006a69'
  on-secondary: '#ffffff'
  secondary-container: '#7df5f4'
  on-secondary-container: '#007070'
  tertiary: '#203965'
  on-tertiary: '#ffffff'
  tertiary-container: '#39507e'
  on-tertiary-container: '#acc3f8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#0e4491'
  secondary-fixed: '#7df5f4'
  secondary-fixed-dim: '#5ed9d7'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#00504f'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#afc6fc'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#2f4673'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  data-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-xs:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system serves an enterprise AI telecommunication and underwriting platform tailored for Indian insurance operations. The audience comprises policy adjudicators, contact-centre managers, and enterprise administrators monitoring high-volume vernacular and multilingual voice interactions.

The emotional tone balances institutional trust, zero-latency situational awareness, and technical assurance. The visual style follows **Corporate / Modern** principles: high information density, structural rhythm, strict hierarchy, and clean surfaces reminiscent of mission-critical customer operations suites. Decorative elements are eliminated in favor of clean data grids, tabular alignment, legible telemetry, and immediate state recognition.

## Colors

The palette establishes high operational clarity under long usage durations.

### Brand & Interactive Colors
- **Primary Deep Blue**: `#1F4E9C` (Default), `#163B75` (Hover), `#0F2A56` (Active / Pressed). Represents institutional insurance trust and structural permanence.
- **Secondary Teal Accent**: `#0EA5A4` (Default), `#E6FFFA` (Light tint / Surface fill). Applied to AI-driven highlights, active call streams, and conversational confidence indicators.

### Surfaces & Borders
- **App Canvas Background**: `#F5F7FA`
- **Surface / Card Background**: `#FFFFFF`
- **Border / Divider Slate**: `#E2E8F0`
- **Muted Canvas Secondary**: `#EDF2F7`

### Semantic & Feedback Colors
- **Success Green**: `#10B981` (Tints: Background `#ECFDF5`, Border `#A7F3D0`, Text `#065F46`)
- **Warning Amber**: `#F59E0B` (Tints: Background `#FFFBEB`, Border `#FDE68A`, Text `#92400E`)
- **Danger Red**: `#EF4444` (Tints: Background `#FEF2F2`, Border `#FECACA`, Text `#991B1B`)
- **Neutral / Informational Slate**: `#64748B` (Tints: Background `#F1F5F9`, Border `#CBD5E1`, Text `#334155`)

### Sandbox Environment Tokens
- **Sandbox Pill Background**: `#FFFBEB`
- **Sandbox Pill Border**: `#FDE68A`
- **Sandbox Text / Icon**: `#92400E`

## Typography

The type system relies universally on **Inter** to ensure maximum legibility across dense data tables, transcriptions, policy reference numbers, and metrics.

### Technical & Numerical Handling
- All numeric displays (policy numbers, premium amounts, caller duration, confidence rates, claim IDs) must enable tabular lining figures using `font-variant-numeric: tabular-nums` or CSS `font-feature-settings: 'tnum' on`.
- Hindi and regional English transliteration within transcripts must render with sufficient line-height (`1.45` to `1.55`) to avoid diacritic clipping.

## Layout & Spacing

The layout model is built on an enterprise 12-column fluid grid tailored for workspace consoles, side-by-side claim reviews, and real-time audio analysis splits.

### Workspace Architecture
- **Console Split**: Default desktop screens partition into a fixed 260px navigation panel, a fluid middle workspace (minimum 640px) for call logs and audio timelines, and a collapsible 380px inspector drawer for live policy context and AI recommendation scoring.
- **Canvas Boundaries**: Outer margin uses `1.5rem` on desktop displays (>1280px) and shrinks to `1rem` on compact displays.
- **Structural Gaps**: Standard component grid gutters are strictly `1rem` (16px) or `1.5rem` (24px) for distinct workbench cards. Component-internal spacing respects the 4px baseline rhythm (`0.25rem`, `0.5rem`, `0.75rem`, `1rem`).

## Elevation & Depth

Visual hierarchy prioritizes crisp borders over deep drop shadows. Depth serves strictly functional roles to indicate overlay layers, pinned headers, and dropdown overlays.

- **Level 0 (Flat / Card Tier)**: `box-shadow: none; border: 1px solid #E2E8F0; background: #FFFFFF;`
- **Level 1 (Hover / Sub-surface Tier)**: `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;`
- **Level 2 (Popovers / Dropdowns / Tooltips)**: `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05); border: 1px solid #E2E8F0;`
- **Level 3 (Modal Dialogs / Critical Call Overlays)**: `box-shadow: 0 10px 15px -3px rgba(15, 42, 86, 0.08), 0 4px 6px -4px rgba(15, 42, 86, 0.04); border: 1px solid #CBD5E1;`

## Shapes

The geometric identity is defined by a standard **8px (`0.5rem`)** border radius for structural modules, creating a disciplined, modern enterprise silhouette. 

- **Cards, Panels, Inputs, Modals, Buttons**: Uniform 8px radius (`roundedness: 2`).
- **Pill Badges & Status Indicators**: Fully rounded pills (`border-radius: 9999px`) to maintain immediate differentiation from action targets and form inputs.

## Components

### Sandbox Top Banner
- Persistent fixed-width or centered anchor pinned below the primary app header.
- Rendered as a distinct pill container: `background: #FFFBEB`, `border: 1px solid #FDE68A`, `padding: 4px 14px`, `border-radius: 9999px`.
- Typography: `label-sm` in `#92400E` with a leading Amber `#F59E0B` warning icon. Text reads: `"Sandbox environment · synthetic data"`.

### Status & Language Badges (Pills)
- Always rendered with `border-radius: 9999px`, height of 22px, padding `2px 10px`, and `label-xs` weight.
- **Language / Dialect Tags** (e.g., *Hindi*, *Tamil*, *Hinglish*): `background: #E6FFFA`, `border: 1px solid #0EA5A4`, `color: #0E7490`.
- **Claim States**:
  - *Active / Escrow*: `#ECFDF5` fill, `#10B981` border, `#065F46` label.
  - *Underwriter Pending*: `#FFFBEB` fill, `#F59E0B` border, `#92400E` label.
  - *Fraud Alert / Rejected*: `#FEF2F2` fill, `#EF4444` border, `#991B1B` label.
  - *Completed / Archived*: `#F1F5F9` fill, `#CBD5E1` border, `#334155` label.

### Buttons
- **Primary**: Background `#1F4E9C`, text `#FFFFFF`, border `none`, radius 8px. Hover: `#163B75`. Active: `#0F2A56`. Focus-visible: outline `2px solid #0EA5A4`, offset `2px`.
- **Secondary / Subtle**: Background `#FFFFFF`, border `1px solid #E2E8F0`, text `#1F4E9C`. Hover: background `#F8FAFC`, border `#CBD5E1`.
- **Tertiary AI Trigger**: Background `#E6FFFA`, border `1px solid #0EA5A4`, text `#0EA5A4`. Hover: background `#CCFBF1`.
- **Destructive**: Background `#EF4444`, text `#FFFFFF`. Hover: `#DC2626`.

### Input Fields & Controls
- **Height**: Standard density 36px (compact) or 40px (default).
- **Surface**: Background `#FFFFFF`, border `1px solid #E2E8F0`, radius 8px, text `#1E293B`, placeholder `#94A3B8`.
- **Interaction**: On focus, border `#1F4E9C`, ring `3px rgba(31, 78, 156, 0.12)`.
- **Checkboxes & Radios**: 16px square/circle, border `#CBD5E1`. When checked: fill `#1F4E9C`, white checkmark or center pip.

### Data Tables & Call Grids
- **Header**: Height 36px, background `#F8FAFC`, bottom border `1px solid #E2E8F0`, text `label-xs` uppercase `#64748B`.
- **Rows**: Alternating neutral states or clean white with `#E2E8F0` separators. Row height 48px. Hover: background `#F8FAFC`.
- **Numeric & Policy Alignment**: Right-aligned or monospace-aligned using `data-mono`.

### Cards & Telephony Panels
- Background `#FFFFFF`, border `1px solid #E2E8F0`, border-radius `8px`, shadow `0 1px 3px rgba(0,0,0,0.05)`.
- Card header divided with a clean `#E2E8F0` divider line when hosting multi-channel audio waveforms and live transcription outputs.