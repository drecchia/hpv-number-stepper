class HpvNumberStepper {
    constructor({
        initialValue = 0,
        min = 0,
        max = 100,
        stepSize = 1,
        onCreate,
        onChange,
        onRender = (val) => `${val}%`,
        layout = ['minus', 'input', 'plus'],
        renderAsHtml = false
    }) {
        this.min = min;
        this.max = max;
        this.stepSize = stepSize;
        this.onChange = onChange;
        this.onRender = onRender;
        this.renderAsHtml = !!renderAsHtml;
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

        if (layout[0] === 'input') {
            this.input.classList.add('stepper-input-left');
        }

        this.btnPlus = document.createElement('button');
        this.btnPlus.textContent = '+';
        this.btnPlus.className = 'stepper-button';

        // Optional display element for HTML rendering
        if (this.renderAsHtml) {
            this.display = document.createElement('span');
            this.display.className = 'stepper-display';
            this.container.tabIndex = 0; // enable keyboard when using display
            this.input.classList.add('stepper-input-hidden');
        }

        // Set initial content
        if (this.renderAsHtml) {
            this.display.innerHTML = this.onRender(this.value, this);
        } else {
            this.input.value = this.onRender(this.value, this);
        }

        // Handlers
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
                this.input.blur();
            }
        };
        if (this.renderAsHtml) {
            this._containerKeydownHandler = (e) => {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this._changeValue(this.stepSize);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this._changeValue(-this.stepSize);
                }
            };
            this._displayClickHandler = () => {
                this.container.focus();
            };
        }

        // Event listeners
        this.btnMinus.addEventListener('click', this._minusHandler);
        this.btnPlus.addEventListener('click', this._plusHandler);
        this.input.addEventListener('change', this._inputHandler);
        this.input.addEventListener('keydown', this._keydownHandler);
        if (this.renderAsHtml) {
            this.container.addEventListener('keydown', this._containerKeydownHandler);
            this.display.addEventListener('click', this._displayClickHandler);
        }

        // Build layout
        const elementMap = {
            minus: this.btnMinus,
            input: this.input,
            plus: this.btnPlus,
        };
        if (this.renderAsHtml) {
            elementMap.display = this.display;
        }
        const contentKey = this.renderAsHtml ? 'display' : 'input';

        layout.forEach((key, idx) => {
            if (elementMap[key]) {
                const el = elementMap[key];
                this.container.appendChild(el);
                if (this.renderAsHtml && key === 'display' && layout[0] === 'display') {
                    el.classList.add('stepper-display-left');
                }

                if (key === 'minus') {
                    const inputIdx = layout.indexOf(contentKey);
                    if (idx < inputIdx) {
                        this.btnMinus.classList.add('stepper-button-left');
                    } else {
                        this.btnMinus.classList.add('stepper-button-right');
                    }
                } else if (key === 'plus') {
                    const inputIdx = layout.indexOf(contentKey);
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
        if (this.renderAsHtml) {
            this.container.removeEventListener('keydown', this._containerKeydownHandler);
            this.display.removeEventListener('click', this._displayClickHandler);
        }

        // Remove from DOM if mounted
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        // Clear references
        this.container = null;
        this.btnMinus = null;
        this.btnPlus = null;
        this.input = null;
        this.display = null;
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
        if (this.renderAsHtml) {
            this.display.innerHTML = this.onRender(sanitized, this);
        } else {
            this.input.value = this.onRender(sanitized, this);
        }

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
        items = [], // [{ id, label } | custom shape, ...]
        initialItem, // full item or key value (string/number)
        keyField = 'id',
        valueField = 'label',
        onChange: userOnChange,
        onCreate: userOnCreate,
        onRender: userOnRender = (item, index, instance) => item?.[(instance && instance.valueField) ? instance.valueField : valueField] || '',
        ...otherOptions
    }) {
        // Find initial index before calling super
        const findIndex = (seed, itemsArray, kf) => {
            if (seed && typeof seed === 'object') {
                const keyVal = seed[kf];
                const idx = itemsArray.findIndex(it => it && it[kf] === keyVal);
                return idx >= 0 ? idx : 0;
            }
            const idx = itemsArray.findIndex(it => it && it[kf] === seed);
            return idx >= 0 ? idx : 0;
        };
        
        const initialSeed = (typeof initialItem !== 'undefined') ? initialItem : (items[0] || null);
        const initialIndex = initialSeed == null ? 0 : findIndex(initialSeed, items, keyField);
        
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
    this.keyField = keyField;
    this.valueField = valueField;
    this.isListMode = true;
        
    // Update button text to chevrons
    this.btnMinus.textContent = '‹';
    this.btnPlus.textContent = '›';
        
    // Add class for styling
    this.container.classList.add('list-stepper');
    }
    
    _findIndex(value) {
        // If full item provided
        if (value && typeof value === 'object') {
            const keyVal = value[this.keyField];
            const idx = this.items.findIndex(item => item && item[this.keyField] === keyVal);
            return idx >= 0 ? idx : 0;
        }
    // Otherwise treat as key value
    const index = this.items.findIndex(item => item && item[this.keyField] === value);
    return index >= 0 ? index : 0;
    }
    
    _parseInput(inputText) {
        // Try to find item by label (case-insensitive partial match)
        const searchText = inputText.toLowerCase().trim();
        const vf = this.valueField || 'label';
        const index = this.items.findIndex(item => {
            const text = (item && item[vf] != null) ? String(item[vf]).toLowerCase() : '';
            return text.includes(searchText);
        });
        return index >= 0 ? index : this.value; // Keep current if not found
    }
    
    // Override sanitize to wrap around instead of clamping
    _sanitize(val) {
        const count = Array.isArray(this.items) ? this.items.length : 0;
        const idx = Math.round(val);
        if (count > 0) {
            // Proper modulo wrap for negative/overflow indices
            return ((idx % count) + count) % count;
        }
        // During construction (before this.items is set), fall back to clamp
        return Math.max(this.min, Math.min(this.max, idx));
    }

    // New methods specific to list functionality
    getSelectedItem() {
        return this.items[this.value];
    }
    
    setSelectedItem(item) {
        if (!item || typeof item !== 'object') {
            console.warn('HpvListStepper.setSelectedItem expects a full item object.');
            return;
        }
        const index = this._findIndex(item);
        this.setValue(index);
    }
    
    updateItems(newItems) {
        const currentItem = this.getSelectedItem();
        this.items = newItems;
        this.max = Math.max(0, newItems.length - 1);
        
        // Try to maintain selection if possible
        if (currentItem) {
            const newIndex = this._findIndex(currentItem);
            this.setValue(newIndex);
        } else {
            this.setValue(0);
        }
    }
}