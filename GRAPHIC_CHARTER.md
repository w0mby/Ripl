# Graphic Charter - Thank You QR

This document outlines the official graphic charter for the Thank You QR application, ensuring consistency across all design elements.

## Color Palette

### Primary Colors
- **Bleu Gratitude (Primary)**: `#3F72AF` - Represents trust and sincerity
- **Vert Croissance (Secondary)**: `#4CAF50` - Symbolizes personal growth and positivity
- **Corail Chaleureux (Accent)**: `#FF7E67` - Expresses warmth and appreciation

### Complementary Shades
- **Bleu Clair**: `#DBE2EF` - For backgrounds and secondary elements
- **Blanc Pur**: `#FFFFFF` - For backgrounds and breathing space
- **Gris Doux**: `#F8F9FA` - For alternating sections
- **Gris Texte**: `#515151` - For main text
- **Bleu Foncé**: `#112D4E` - For headings and accent text

### Button States
- **Success**: `#4CAF50`
- **In Progress**: `#FFC107`
- **Information**: `#2196F3`
- **Warning**: `#FF5722`

## Typography

### Main Font
- **Family**: 'Roboto', sans-serif
- **Weights**: 300 (light), 400 (regular), 500 (medium), 700 (bold)

### Heading Font
- **Family**: 'Montserrat', sans-serif
- **Weights**: 600 (semi-bold), 700 (bold)

### Typographic Hierarchy
- **H1**: 32px, Montserrat Bold
- **H2**: 24px, Montserrat Semi-Bold
- **H3**: 20px, Montserrat Semi-Bold
- **Body**: 16px, Roboto Regular
- **Caption**: 14px, Roboto Light
- **Button**: 16px, Roboto Medium

## UI Components

### Thank You Cards
- **Background**: White (`#FFFFFF`)
- **Shadow**: `0 4px 6px rgba(0, 0, 0, 0.1)`
- **Border**: 8px radius
- **Accent**: 2px solid top border (`#3F72AF`)

### Buttons
- **Primary**: Background `#3F72AF`, white text
- **Secondary**: Outline `#3F72AF`, text `#3F72AF`
- **Tertiary**: Text `#3F72AF` with no background or outline
- **Border Radius**: 4px

### Icons
- **Style**: Outlined
- **Standard Size**: 24px
- **Primary Color**: `#3F72AF`
- **Secondary Color**: `#515151`
- **Accent Icons**: `#FF7E67` (for hearts and appreciation elements)

## Illustrations and Imagery
- **Style**: Flat or isometric illustrations with colors from the palette
- **Themes**: Gratitude, human connection, kindness chains
- **Photos**: Bright images with warm tonality

## Animations and Transitions
- **Standard Duration**: 300ms
- **Acceleration Curve**: ease-in-out
- **Button Hover**: Transform translateY(-2px) with box-shadow increase
- **Card Hover**: Subtle uplift (translateY(-5px)) with increased shadow
- **Text Gradients**: Animated shifting background positions (8s cycle)
- **Header Scroll**: Shrinking effect and opacity changes
- **Heart Icons**: Heartbeat animation on hover
- **Map Markers**: Pulse effect on hover
- **Sharing CTA**: Attention-pulse border animation with shimmer overlay
- **Mobile Navigation**: Color shift on active state

## Data Visualization
- **Thank You Cards Exchanged**: Line graph with `#3F72AF`
- **Geographic Distribution**: Choropleth map with gradients from `#DBE2EF` to `#3F72AF`
- **Stats**: Icons with animated counters
- **Map Markers**: `#FF7E67` location pins

## Header & Navigation

### Desktop Header
- **Style**: Translucent header with blur backdrop filter
- **Height**: 64px (normal), 60px (when scrolled)
- **Background**: `rgba(255,255,255,0.85)` with `backdrop-filter: blur(8px)`
- **Border**: `1px solid rgba(63, 114, 175, 0.1)` (bottom)
- **Behavior**: 
  - Becomes more opaque on scroll (`rgba(255,255,255,0.95)`)
  - Shrinks slightly when scrolling down
  - Hides when scrolling down and reveals when scrolling up
- **Logo**: Montserrat 600, `#112D4E` with coral heart icon

### Mobile Header
- **Style**: Same as desktop, but shorter
- **Height**: 56px (normal), 54px (when scrolled)

### Bottom Navigation (Mobile Only)
- **Style**: Fixed position at bottom of screen
- **Height**: 56px
- **Background**: `rgba(255,255,255,0.95)` with blur backdrop
- **Icon + Label**: Simple icon with short text underneath
- **Active State**: Primary color (`#3F72AF`)
- **Inactive State**: Text color (`#515151`)

### Navigation Buttons
- **Style**: Text buttons (Roboto Medium, 16px)
- **Color**: Primary color (`#3F72AF`)
- **Hover**: No background, subtle transition
- **CTAs**: Primary contained buttons with 4px border radius

### Contextual Navigation
- **Home/Info Pages**: Full navigation with all options
- **Scan Result Pages**: Minimalist navigation, focus on content
- **Creation Flow**: Progressive navigation showing steps

### Adaptive UI Philosophy
- **Header Presence**: Header adapts to context rather than being completely removed
- **Content Priority**: UI elements should never compete with gratitude content
- **Emotional Impact**: Navigation should be invisible when users are experiencing moments of gratitude
- **Progressive Disclosure**: Features revealed as needed based on user journey
- **Consistent Anchoring**: Maintaining some navigation elements for wayfinding
- **Transition Smoothness**: Transitions between contexts should be fluid and non-jarring

## Mobile Adaptations
- **Reduced Spacing**: 16px (standard)
- **Text Size**: -2px compared to desktop for all elements
- **Bottom Navigation**: Icon + label pattern for main actions 
- **Footer**: Hidden on mobile to avoid redundancy with bottom navigation
- **Content Padding**: Extra bottom padding (pb: 8) to accommodate bottom navigation

## Usage Guidelines
- Maintain adequate contrast for accessibility
- Ensure consistent spacing (multiples of 8px)
- Use the accent color (`#FF7E67`) sparingly for maximum impact
- Apply animations judiciously to avoid overwhelming the user
- Keep interface clean and focused on gratitude elements

## Implementation
- CSS variables for colors and transitions
- Font imports from Google Fonts
- Material-UI theming for component consistency

---

*This graphic charter should be followed for all designs and implementations to maintain a consistent and professional experience across the Thank You QR application.*