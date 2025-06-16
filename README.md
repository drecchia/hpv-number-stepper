# HPV Number Stepper

A zero-dependency JavaScript library for building interactive number steppers with customizable layouts and callbacks.

![License](https://img.shields.io/badge/license-CC--BY--NC--4.0-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg)

## Screenshots

![HPV Number Stepper Example](docs/images/Screenshot_2.png)

![HPV Number Stepper in Action](docs/images/Screenshot_3.png)

## Features

- 🚀 **Zero dependencies** - Pure vanilla JavaScript
- 🎨 **Customizable layout** - Arrange buttons and input field in any order
- 🔢 **Flexible value formatting** - Custom rendering with callback functions
- ⌨️ **Keyboard support** - Arrow keys and Enter key navigation
- 🎯 **Event callbacks** - onCreate, onChange, and onRender hooks
- 📱 **Responsive design** - Works on desktop and mobile
- 🧹 **Memory safe** - Proper cleanup with destroy method

## Installation

### Direct Download

Download the files and include them in your HTML:

```html
<link rel="stylesheet" href="path/to/number-stepper.css">
<script src="path/to/number-stepper.js"></script>
```

### npm (Coming Soon)

```bash
npm install hpv-number-stepper
```

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="number-stepper.css">
</head>
<body>
    <div id="stepper-container"></div>
    
    <script src="number-stepper.js"></script>
    <script>
        const container = document.getElementById('stepper-container');
        const stepper = new HpvNumberStepper({
            initialValue: 5,
            min: 0,
            max: 100,
            stepSize: 1
        });
        
        stepper.mountTo(container);
    </script>
</body>
</html>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `initialValue` | Number | `0` | Starting value for the stepper |
| `min` | Number | `0` | Minimum allowed value |
| `max` | Number | `100` | Maximum allowed value |
| `stepSize` | Number | `1` | Amount to increment/decrement |
| `layout` | Array | `['minus', 'input', 'plus']` | Order of elements |
| `onCreate` | Function | `undefined` | Callback when stepper is created |
| `onChange` | Function | `undefined` | Callback when value changes |
| `onRender` | Function | `(val) => \`${val}%\`` | Custom value formatting |

## Examples

### Basic Usage

```javascript
const stepper = new HpvNumberStepper({
    initialValue: 10,
    min: 0,
    max: 50,
    stepSize: 5
});
```

![Basic Number Stepper](docs/images/Screenshot_2.png)

### Custom Layout

```javascript
const stepper = new HpvNumberStepper({
    initialValue: 0,
    layout: ['plus', 'input', 'minus'] // Plus button first
});
```

### Percentage Stepper

```javascript
const stepper = new HpvNumberStepper({
    initialValue: 25,
    min: 0,
    max: 100,
    stepSize: 0.5,
    onRender: (val) => `${val.toFixed(1)}%`,
    onChange: (val, instance) => {
        console.log(`Value changed to: ${val}%`);
    }
});
```

![Percentage Stepper Example](docs/images/Screenshot_3.png)

### Currency Stepper

```javascript
const stepper = new HpvNumberStepper({
    initialValue: 10.00,
    min: 0,
    max: 1000,
    stepSize: 0.25,
    onRender: (val) => `$${val.toFixed(2)}`,
    onChange: (val) => {
        console.log(`Price: $${val.toFixed(2)}`);
    }
});
```

### Input-First Layout

```javascript
const stepper = new HpvNumberStepper({
    initialValue: 5,
    layout: ['input', 'minus', 'plus'], // Input field first
    onRender: (val) => `${val} items`
});
```

## API Methods

### `mountTo(element)`
Mounts the stepper to a DOM element.

```javascript
const container = document.getElementById('my-container');
stepper.mountTo(container);
```

### `setValue(value)`
Programmatically sets the stepper value.

```javascript
stepper.setValue(25);
stepper.setValue('30.5'); // String values are parsed
```

### `getValue(rendered)`
Gets the current value.

```javascript
const rawValue = stepper.getValue(); // Returns number
const displayValue = stepper.getValue(true); // Returns formatted string
```

### `destroy()`
Cleans up event listeners and removes from DOM.

```javascript
stepper.destroy();
```

## Keyboard Support

- **Arrow Up** - Increment value
- **Arrow Down** - Decrement value  
- **Enter** - Confirm input and remove focus

## Styling

The component uses CSS custom properties and can be easily customized:

```css
.stepper-container {
    border: 2px solid #007bff;
    border-radius: 8px;
    font-family: 'Arial', sans-serif;
}

.stepper-button {
    background-color: #f8f9fa;
    color: #007bff;
    font-weight: bold;
}

.stepper-button:hover {
    background-color: #e9ecef;
}

.stepper-input {
    font-size: 16px;
    padding: 8px 12px;
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Development

### Building

```bash
npm install
npm run build
```

### Project Structure

```
├── src/
│   ├── js/
│   │   └── number-stepper.js    # Main JavaScript file
│   └── css/
│       └── number-stepper.css   # Styles
├── gulp/                        # Build tasks
├── index.html                   # Demo page
└── package.json
```

### Build System

This project uses Gulp for building:

- `gulp` - Build both JS and CSS
- `gulp js` - Build JavaScript only
- `gulp css` - Build CSS only  
- `gulp watch` - Watch for changes and rebuild

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License](https://creativecommons.org/licenses/by-nc/4.0/).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

**Danilo T Recchia**

- GitHub: [@drecchia](https://github.com/drecchia)
- Repository: [hpv-number-stepper](https://github.com/drecchia/hpv-number-stepper)

## Changelog

### v1.0.0
- Initial release
- Zero-dependency implementation
- Customizable layouts
- Keyboard support
- Event callbacks
- Memory management
