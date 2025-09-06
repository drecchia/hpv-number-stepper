# Tech

## Technologies Used

### Core Technologies
- **JavaScript (ES6+)**: Pure vanilla JavaScript with modern features (classes, arrow functions, destructuring)
- **CSS3**: Custom properties, flexbox, and modern layout techniques
- **HTML5**: Semantic markup for demo and documentation

### Build System
- **Gulp**: Task runner for build automation
- **PostCSS**: CSS processing with nested syntax support
- **Autoprefixer**: Automatic vendor prefixing for cross-browser compatibility
- **CleanCSS**: CSS minification and optimization
- **UglifyJS**: JavaScript minification

### Development Tools
- **Node.js**: Runtime environment for build tools
- **npm**: Package management for dependencies

## Development Setup

### Prerequisites
- Node.js (version 14+ recommended)
- npm (comes with Node.js)

### Installation
```bash
npm install
```

### Build Commands
```bash
npm run build    # Build both JS and CSS
gulp js          # Build JavaScript only
gulp css         # Build CSS only
gulp watch       # Watch for changes and rebuild automatically
```

### Project Structure
```
├── src/
│   ├── js/number-stepper.js    # Main source code
│   └── css/number-stepper.css  # Main styles
├── gulp/                       # Build task definitions
│   ├── js.js                   # JavaScript build tasks
│   └── css.js                  # CSS build tasks
├── dist/                       # Build output (generated)
│   ├── js/all.min.js           # Minified JavaScript
│   └── css/all.css             # Processed CSS
└── index.html                  # Demo page
```

## Technical Constraints

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance Requirements
- Zero external dependencies
- Minimal bundle size (< 10KB minified)
- No impact on page load performance
- Memory-safe with proper cleanup

### Code Quality Standards
- ES6+ features with transpilation if needed
- Modular class-based architecture
- Proper error handling and validation
- Comprehensive event listener cleanup

## Dependencies

### Build Dependencies (devDependencies)
- `gulp`: ^4.0.2 - Task runner
- `gulp-autoprefixer`: ^8.0.0 - CSS vendor prefixing
- `gulp-clean-css`: ^4.3.0 - CSS minification
- `gulp-concat`: ^2.6.1 - File concatenation
- `gulp-postcss`: ^10.0.0 - CSS processing
- `gulp-uglify`: ^3.0.2 - JavaScript minification
- `postcss-nested`: ^7.0.2 - Nested CSS syntax

### Runtime Dependencies
- **None** - Pure vanilla JavaScript

## Tool Usage Patterns

### Gulp Build System
- **Default Task**: `gulp` - Runs both JS and CSS builds in parallel
- **Individual Tasks**: `gulp js`, `gulp css` for targeted builds
- **Watch Mode**: `gulp watch` for development with automatic rebuilds
- **Error Handling**: Continues on build errors to prevent stopping the pipeline

### CSS Processing Pipeline
1. Source CSS files with nested syntax
2. PostCSS processes nested rules
3. Autoprefixer adds vendor prefixes
4. CleanCSS minifies and optimizes
5. Output to dist/css/all.css

### JavaScript Processing Pipeline
1. Source JavaScript files
2. Concatenation into single file
3. UglifyJS minification with error handling
4. Output to dist/js/all.min.js

### Development Workflow
1. Make changes to source files in src/
2. Run `gulp watch` for automatic builds
3. Test changes in index.html demo page
4. Commit changes when ready