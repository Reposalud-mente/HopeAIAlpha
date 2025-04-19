# HopeAI Design Guidelines

## Design Philosophy

HopeAI's design philosophy centers on creating a minimalist, sophisticated experience that prioritizes the needs of clinical professionals. Our design system emphasizes clarity, focus, and human-centered interactions to help psychologists concentrate on what truly matters: their patients.

## Core Design Principles

### 1. Minimalist Sophistication
- **Clean Visual Hierarchy**: Prioritize essential information with ample white space
- **Refined Typography**: Use a limited set of font sizes and weights for clear hierarchy
- **Subtle Elegance**: Favor understated design elements over flashy ones
- **Purposeful Elements**: Every component should serve a clear function

### 2. Human-Centered Experience
- **Intuitive Navigation**: Create predictable, easy-to-understand user flows
- **Reduced Cognitive Load**: Limit choices and information density per screen
- **Accessible Design**: Ensure readability and usability for all users
- **Empathetic Interactions**: Design with the clinical user's needs and context in mind

### 3. Thoughtful Visual Language
- **Monochromatic Base**: Black text on white backgrounds as the foundation
- **Subtle Accents**: Use opacity variations (black/75, black/50) for visual hierarchy
- **Intentional Spacing**: Consistent padding and margins throughout the interface
- **Gentle Animations**: Slow, subtle transitions that create a sense of calm

## Design System Components

### Typography

#### Font Family
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
```

#### Headings
- **H1 (Page Title)**: 
  ```css
  text-3xl md:text-4xl font-normal tracking-tight text-gray-900
  ```
- **H2 (Section Title)**: 
  ```css
  text-sm uppercase tracking-wider text-gray-500 font-medium
  ```
- **H3 (Subsection Title)**: 
  ```css
  text-lg font-medium text-gray-900
  ```

#### Body Text
- **Primary**: 
  ```css
  text-base text-gray-600
  ```
- **Secondary**: 
  ```css
  text-sm text-gray-500
  ```
- **Caption/Small**: 
  ```css
  text-xs text-gray-400
  ```

### Color Palette

#### Primary Colors
- **Black**: `#000000` - For key elements and primary actions
- **White**: `#FFFFFF` - Base canvas and background

#### Neutral Colors
- **Gray-50**: `#F9FAFB` - Cards and secondary elements
- **Gray-100**: `#F3F4F6` - Borders and dividers
- **Gray-200**: `#E5E7EB` - Subtle separators
- **Gray-400**: `#9CA3AF` - Secondary text
- **Gray-500**: `#6B7280` - Tertiary text
- **Gray-600**: `#4B5563` - Body text
- **Gray-900**: `#111827` - Headings

### Components

#### Buttons

##### Primary Button
```html
<button class="bg-black text-white rounded-md py-3 px-6 font-medium transition-all duration-500 hover:bg-black/90">
  Comenzar
</button>
```

##### Secondary Button
```html
<button class="bg-white text-black border border-gray-200 rounded-md py-3 px-6 font-medium transition-all duration-500 hover:bg-gray-50">
  Más información
</button>
```

##### Text Button
```html
<button class="text-gray-600 font-medium hover:text-black transition-colors duration-300">
  Ver detalles
</button>
```

#### Cards

##### Feature Card
```html
<div class="border-l-4 border-black p-5 bg-gray-50 rounded-lg transition-all duration-700 hover:bg-gray-100">
  <h3 class="font-medium text-black mb-1">Reduce la carga administrativa</h3>
  <p class="text-gray-600 text-sm">Más tiempo para tus pacientes, menos para el papeleo.</p>
</div>
```

##### Content Card
```html
<div class="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
  <div class="content">
    <!-- Card content -->
  </div>
</div>
```

#### Dividers

##### Text Divider
```html
<div class="relative flex items-center py-5">
  <div class="flex-grow border-t border-gray-200"></div>
  <span class="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-wider">BENEFICIOS CLAVE</span>
  <div class="flex-grow border-t border-gray-200"></div>
</div>
```

##### Simple Divider
```html
<hr class="border-gray-100 my-6" />
```

#### Icons
- Use simple, outlined icons with 2px stroke width
- Size proportional to text (16px for body text)
- Color: `text-gray-400` for secondary information
- Recommended icon sets: Heroicons, Phosphor Icons

### Layout Principles

#### Spacing
- Base unit: 4px (0.25rem)
- Common spacing values:
  - 4px (0.25rem): Minimal spacing
  - 8px (0.5rem): Tight spacing
  - 16px (1rem): Standard spacing
  - 24px (1.5rem): Comfortable spacing
  - 32px (2rem): Section spacing
  - 48px (3rem): Large section spacing
  - 64px (4rem): Page section spacing

#### Container Widths
- Content container: `max-w-5xl mx-auto`
- Section container: `max-w-md`
- Full-width container: `w-full`

#### Responsive Behavior
- Mobile-first approach
- Key breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

#### Grid System
- Use Flexbox for simple layouts
- Use CSS Grid for complex layouts
- Standard column gap: `gap-6` (1.5rem)
- Standard row gap: `gap-8` (2rem)

### Interaction Patterns

#### Transitions
- Quick transitions (hover states): `transition-all duration-300`
- Medium transitions (emphasis): `transition-all duration-500`
- Slow transitions (ambient): `transition-all duration-700`
- Use `ease-in-out` for natural movement

#### Hover States
- Buttons: Slight opacity change (`hover:bg-black/90`)
- Cards: Background lightening (`hover:bg-gray-100`)
- Links: Color change (`hover:text-black`)

#### Focus States
- Visible focus ring: `focus:ring-2 focus:ring-offset-2 focus:ring-black focus:outline-none`
- High contrast for accessibility

### Implementation Guidelines

1. **Consistency First**: Reuse established patterns before creating new ones
2. **Progressive Enhancement**: Start with core functionality, then add refinement
3. **Performance Matters**: Optimize animations and transitions for smooth experience
4. **Accessibility Always**: Maintain contrast ratios and keyboard navigation
5. **Cohesive Experience**: Ensure visual and interaction patterns remain consistent

## Example Implementation

The HopeAI landing page exemplifies our design philosophy with:

- Clean, minimalist layout with ample white space
- Clear visual hierarchy with refined typography
- Monochromatic color scheme with subtle accents
- Intuitive navigation and reduced cognitive load
- Purposeful elements that serve clear functions

```html
<!-- Example Header -->
<header class="w-full py-6 px-6 absolute top-0 left-0 z-10">
  <div class="flex justify-between items-center max-w-6xl mx-auto">
    <span class="text-2xl font-semibold text-black tracking-tight">HopeAI</span>
  </div>
</header>

<!-- Example Feature Section -->
<section class="py-12">
  <div class="max-w-5xl mx-auto px-6">
    <div class="relative flex items-center py-5">
      <div class="flex-grow border-t border-gray-200"></div>
      <span class="flex-shrink mx-4 text-xs text-gray-400 uppercase tracking-wider">BENEFICIOS CLAVE</span>
      <div class="flex-grow border-t border-gray-200"></div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <!-- Feature Card -->
      <div class="border-l-4 border-black p-5 bg-gray-50 rounded-lg transition-all duration-700 hover:bg-gray-100">
        <h3 class="font-medium text-black mb-1">Reduce la carga administrativa</h3>
        <p class="text-gray-600 text-sm">Más tiempo para tus pacientes, menos para el papeleo.</p>
      </div>
      
      <!-- More feature cards... -->
    </div>
  </div>
</section>
```

By adhering to these design guidelines, we ensure a consistent, sophisticated, and human-centered experience across all components, elements, and pages of the HopeAI application.
