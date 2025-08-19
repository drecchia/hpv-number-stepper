class HpvNumberStepper {
    constructor({
        initialValue = 0,
        min = 0,
        max = 100,
        stepSize = 1,
        onCreate,
        onChange,
        onRender = (val) => `${val}%`,
        layout = ['minus', 'input', 'plus']
    }) {
        this.min = min;
        this.max = max;
        this.stepSize = stepSize;
        this.onChange = onChange;
        this.onRender = onRender;
        this.value = this._sanitize(initialValue);

        // Create elements
        this.container = document.createElement('div');
        this.container.className = 'stepper-container';

        this.btnMinus = document.createElement('button');
        this.btnMinus.textContent = '−';
        this.btnMinus.className = 'stepper-button';

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'stepper-input';
        this.input.value = this.onRender(this.value, this);

        if (layout[0] == 'input') {
            this.input.classList.add('stepper-input-left');
        }

        this.btnPlus = document.createElement('button');
        this.btnPlus.textContent = '+';
        this.btnPlus.className = 'stepper-button';

        // Store event handlers for cleanup
        this._minusHandler = () => this._changeValue(-this.stepSize);
        this._plusHandler = () => this._changeValue(this.stepSize);
        this._inputHandler = () => {
            const parsed = this._parseInput(this.input.value);
            this._updateValue(parsed);
        };
        this._keydownHandler = (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this._changeValue(this.stepSize);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this._changeValue(-this.stepSize);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.input.blur(); // Remove focus from input
            }
        };

        // Event listeners
        this.btnMinus.addEventListener('click', this._minusHandler);
        this.btnPlus.addEventListener('click', this._plusHandler);
        this.input.addEventListener('change', this._inputHandler);
        this.input.addEventListener('keydown', this._keydownHandler);

        // Build layout
        const elementMap = {
            minus: this.btnMinus,
            input: this.input,
            plus: this.btnPlus,
        };

        layout.forEach((key, idx) => {
            if (elementMap[key]) {
                this.container.appendChild(elementMap[key]);

                // Add appropriate styling based on button positions
                if (key === 'minus') {
                    // Check if minus button is to the left of input
                    const inputIdx = layout.indexOf('input');
                    if (idx < inputIdx) {
                        this.btnMinus.classList.add('stepper-button-left');
                    } else {
                        this.btnMinus.classList.add('stepper-button-right');
                    }
                } else if (key === 'plus') {
                    // Check if plus button is to the right of input
                    const inputIdx = layout.indexOf('input');
                    if (idx > inputIdx) {
                        this.btnPlus.classList.add('stepper-button-right');
                    } else {
                        this.btnPlus.classList.add('stepper-button-left');
                    }
                }
            }
        });

        if (typeof onCreate === 'function') {
            onCreate(this.value, this);
        }
    }

    mountTo(element) {
        element.appendChild(this.container);
    }

    setValue(newValue) {
        const parsed = typeof newValue === 'string' ? this._parseInput(newValue) : newValue;
        this._updateValue(parsed);
    }

    getValue(rendered = false) {
        return rendered ? this.onRender(this.value, this) : this.value;
    }

    destroy() {
        // Remove event listeners
        this.btnMinus.removeEventListener('click', this._minusHandler);
        this.btnPlus.removeEventListener('click', this._plusHandler);
        this.input.removeEventListener('change', this._inputHandler);
        this.input.removeEventListener('keydown', this._keydownHandler);

        // Remove from DOM if mounted
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        // Clear references
        this.container = null;
        this.btnMinus = null;
        this.btnPlus = null;
        this.input = null;
        this.onChange = null;
        this.onRender = null;
    }

    _parseInput(inputText) {
        const numeric = parseFloat(inputText.replace(/[^\d.-]/g, ''));
        return isNaN(numeric) ? this.min : numeric;
    }

    _sanitize(val) {
        return Math.max(this.min, Math.min(this.max, val));
    }

    _updateValue(newVal) {
        const sanitized = this._sanitize(newVal);
        this.value = sanitized;
        this.input.value = this.onRender(sanitized, this);

        if (typeof this.onChange === 'function') {
            this.onChange(sanitized, this);
        }
    }

    _changeValue(delta) {
        this._updateValue(this.value + delta);
    }
}

class HpvListStepper extends HpvNumberStepper {
    constructor({
        items = [], // [{ id, label }, ...]
        initialValue = 0, // index or id
        onChange: userOnChange,
        onCreate: userOnCreate,
        onRender: userOnRender = (item, index) => item?.label || '',
        ...otherOptions
    }) {
        // Find initial index before calling super
        const findIndex = (value, itemsArray) => {
            if (typeof value === 'number' && value >= 0 && value < itemsArray.length) {
                return value; // Treat as index
            }
            
            // Try to find by id
            const index = itemsArray.findIndex(item => item.id === value);
            return index >= 0 ? index : 0;
        };
        
        const initialIndex = findIndex(initialValue, items);
        
        // Call parent constructor with modified options
        super({
            ...otherOptions,
            initialValue: initialIndex,
            min: 0,
            max: Math.max(0, items.length - 1),
            stepSize: 1,
            onChange: (index, instance) => {
                const list = (instance && instance.items) ? instance.items : items;
                const item = list[index];
                if (typeof userOnChange === 'function') userOnChange(item, index, instance);
            },
            onCreate: (index, instance) => {
                const list = (instance && instance.items) ? instance.items : items;
                const item = list[index];
                if (typeof userOnCreate === 'function') userOnCreate(item, index, instance);
            },
            onRender: (index, instance) => {
                const list = (instance && instance.items) ? instance.items : items;
                const item = list[index];
                return userOnRender(item, index, instance);
            }
        });
        
    // Store list-specific properties AFTER super() call
    this.items = items;
    this.isListMode = true;
        
    // Update button text to chevrons
    this.btnMinus.textContent = '‹';
    this.btnPlus.textContent = '›';
        
    // Add class for styling
    this.container.classList.add('list-stepper');
    }
    
    _findIndex(value) {
        if (typeof value === 'number' && value >= 0 && value < this.items.length) {
            return value; // Treat as index
        }
        
        // Try to find by id
        const index = this.items.findIndex(item => item.id === value);
        return index >= 0 ? index : 0;
    }
    
    _parseInput(inputText) {
        // Try to find item by label (case-insensitive partial match)
        const searchText = inputText.toLowerCase().trim();
        const index = this.items.findIndex(item => 
            item.label.toLowerCase().includes(searchText)
        );
        return index >= 0 ? index : this.value; // Keep current if not found
    }
    
    // Override sanitize to wrap around instead of clamping
    _sanitize(val) {
        const count = Array.isArray(this.items) ? this.items.length : 0;
        if (count <= 0) return 0;
        const idx = Math.round(val);
        // Proper modulo wrap for negative/overflow indices
        return ((idx % count) + count) % count;
    }

    // New methods specific to list functionality
    getSelectedItem() {
        return this.items[this.value];
    }
    
    setSelectedItem(idOrIndex) {
        const index = this._findIndex(idOrIndex);
        this.setValue(index);
    }
    
    updateItems(newItems) {
        const currentItem = this.getSelectedItem();
        this.items = newItems;
        this.max = Math.max(0, newItems.length - 1);
        
        // Try to maintain selection if possible
        if (currentItem) {
            const newIndex = this._findIndex(currentItem.id);
            this.setValue(newIndex);
        } else {
            this.setValue(0);
        }
    }
}