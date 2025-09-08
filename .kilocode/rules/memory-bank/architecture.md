# Architecture

## System Architecture

The HPV Number Stepper is a zero-dependency JavaScript library built with a modular, class-based architecture. It follows an inheritance pattern where `HpvStepperBase` serves as the foundation for both `HpvNumberStepper` and `HpvListStepper` implementations.

## Source Code Paths

### Core Files
- `src/js/number-stepper.js` - Main implementation with base and concrete stepper classes
- `src/css/number-stepper.css` - Styling for stepper components
- `index.html` - Demo and testing page
- `gulpfile.js` - Build system entry point
- `gulp/js.js` - JavaScript build tasks
- `gulp/css.js` - CSS build tasks

### Build Output
- `dist/js/all.min.js` - Minified JavaScript bundle
- `dist/css/all.css` - Processed CSS bundle

## Key Technical Decisions

### Inheritance-Based Design
- `HpvStepperBase` provides shared functionality for DOM creation, event handling, and lifecycle management
- `HpvNumberStepper` extends base for numeric value handling
- `HpvListStepper` extends base for list-based selection with wrap-around behavior

### Zero-Dependency Approach
- Pure vanilla JavaScript implementation
- No external libraries or frameworks required
- Ensures minimal bundle size and no dependency conflicts

### Flexible Rendering System
- Support for both text input and HTML display modes
- Customizable value formatting through callback functions
- Content selection control for different use cases

### Always-on HTML Rendering with Dynamic Editing
- Hardcoded `renderAsHtml` enabled (no toggling option)
- Always uses `.stepper-display` mode, ignoring input-related options
- Click handler on display creates dynamic input (`type="text"`, `class="stepper-input-dynamic"`) for editing
- Optional `renderInputValue` callback for plain text extraction (default: raw value for numbers, HTML stripping via `textContent` or regex replace for lists)
- Auto-focus on dynamic input with events for Enter/Blur to parse and update value (`parseFloat` for numbers, text match for list index)
- Escape key to cancel and re-render original display
- CSS updated for `.stepper-input-dynamic` to match display styles seamlessly

## Design Patterns

### Template Method Pattern
- Base class defines the skeleton of stepper creation and management
- Subclasses implement specific parsing and sanitization logic

### Observer Pattern
- Event callbacks (`onCreate`, `onChange`, `onRender`) for external integration
- Allows components to react to stepper state changes
- Extended to handle dynamic input events including click on display, keydown for Enter/Escape, and blur events

### Factory Pattern
- Constructor-based instantiation with configuration objects
- Flexible option handling for different stepper types

## Component Relationships

### DOM Structure
```
.stepper-container
├── .stepper-button (minus)
├── .stepper-input / .stepper-display
└── .stepper-button (plus)
```

### Class Hierarchy
```
HpvStepperBase
├── HpvNumberStepper
└── HpvListStepper
```

### Build System Flow
```
Source Files → Gulp Tasks → Processed Output
    ↓              ↓              ↓
src/js/*.js  →  gulp/js.js  →  dist/js/all.min.js
src/css/*.css → gulp/css.js →  dist/css/all.css
```

## Critical Implementation Paths

### Initialization Flow
1. Constructor receives configuration options
2. DOM elements are created and structured
3. Event listeners are attached
4. Layout is built according to configuration
5. Initial value is set and displayed
6. `onCreate` callback is triggered
7. Setup display-only mode with click handler for dynamic input creation

### Value Change Flow
1. User interaction (click/keyboard) triggers event
2. Value is parsed and sanitized
3. Internal state is updated
4. Display is refreshed
5. `onChange` callback is triggered
6. If change originates from dynamic input, handle parsing (`parseFloat` for numbers, text match for lists), update state, and re-render display with HTML

### Cleanup Flow
1. All event listeners are removed
2. DOM elements are detached
3. References are nullified for garbage collection
4. Remove dynamic input event listeners if a dynamic input is active

### Build Process
1. Source files are collected
2. JavaScript is concatenated and minified
3. CSS is processed with PostCSS, autoprefixed, and minified
4. Output files are written to dist/ directory