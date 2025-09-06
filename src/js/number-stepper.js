class HpvStepperBase {
    constructor({
        initialValue = 0,
        min = 0,
        max = 100,
        stepSize = 1,
        onCreate,
        onChange,
        renderValue = (val) => `${val}%`,
        layout = ['minus', 'input', 'plus'],
        renderAsHtml = false,
        allowContentSelection = true
    }) {
        this.min = min;
        this.max = max;
        this.stepSize = stepSize;
        this.onChange = onChange;
        this.renderValue = renderValue;
        this.renderAsHtml = !!renderAsHtml;
        this.allowContentSelection = allowContentSelection;
        this.value = this._sanitize(initialValue);

        this._createElements();
        this._setupEventListeners();
        this._buildLayout(layout);
        this._updateValue(this.value);

        if (typeof onCreate === 'function') {
            onCreate(this.value, this);
        }
    }

    // Shared DOM creation
    _createElements() {
        this.container = document.createElement('div');
        this.container.className = 'stepper-container';

        this.btnMinus = document.createElement('button');
        this.btnMinus.textContent = '−';
        this.btnMinus.className = 'stepper-button';

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'stepper-input';

        this.btnPlus = document.createElement('button');
        this.btnPlus.textContent = '+';
        this.btnPlus.className = 'stepper-button';

        if (this.renderAsHtml) {
            this.display = document.createElement('span');
            this.display.className = 'stepper-display';
            if (!this.allowContentSelection) {
                this.display.classList.add('no-select');
            }
            this.container.tabIndex = 0;
            this.input.classList.add('stepper-input-hidden');
        } else {
            if (!this.allowContentSelection) {
                this.input.classList.add('no-select');
            }
        }
    }

    // Shared event setup
    _setupEventListeners() {
        this._setupButtonListeners();
        this._setupInputListeners();
        if (this.renderAsHtml) {
            this._setupContainerListeners();
        }
    }

    _setupButtonListeners() {
        this._minusHandler = () => this._changeValue(-this.stepSize);
        this._plusHandler = () => this._changeValue(this.stepSize);
        this.btnMinus.addEventListener('click', this._minusHandler);
        this.btnPlus.addEventListener('click', this._plusHandler);
    }

    _setupInputListeners() {
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
        this.input.addEventListener('change', this._inputHandler);
        this.input.addEventListener('keydown', this._keydownHandler);

        if (!this.allowContentSelection) {
            this._selectStartHandler = (e) => e.preventDefault();
            this.input.addEventListener('selectstart', this._selectStartHandler);
        }
    }

    _setupContainerListeners() {
        this._containerKeydownHandler = (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this._changeValue(this.stepSize);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this._changeValue(-this.stepSize);
            }
        };
        this._displayClickHandler = () => this.container.focus();
        this.container.addEventListener('keydown', this._containerKeydownHandler);
        this.display.addEventListener('click', this._displayClickHandler);
    }

    // Shared layout building
    _buildLayout(layout) {
        const elementMap = {
            minus: this.btnMinus,
            input: this.input,
            plus: this.btnPlus,
        };
        if (this.renderAsHtml) {
            elementMap.display = this.display;
        }
        const contentKey = this.renderAsHtml ? 'display' : 'input';
        const contentIdx = layout.indexOf(contentKey);

        layout.forEach((key, idx) => {
            const el = elementMap[key];
            if (!el) return;

            this.container.appendChild(el);

            if (this.renderAsHtml && key === 'display' && idx === 0) {
                el.classList.add('stepper-display-left');
            }

            if (key === 'minus') {
                el.classList.add(idx < contentIdx ? 'stepper-button-left' : 'stepper-button-right');
            } else if (key === 'plus') {
                el.classList.add(idx > contentIdx ? 'stepper-button-right' : 'stepper-button-left');
            }
        });
    }

    // Shared methods
    mountTo(element) {
        element.appendChild(this.container);
    }

    setValue(newValue) {
        const parsed = typeof newValue === 'string' ? this._parseInput(newValue) : newValue;
        this._updateValue(parsed);
    }

    getValue(rendered = false) {
        return rendered ? this.renderValue(this.value, this) : this.value;
    }

    destroy() {
        // Remove listeners and clean up (shared logic)
        this.btnMinus.removeEventListener('click', this._minusHandler);
        this.btnPlus.removeEventListener('click', this._plusHandler);
        this.input.removeEventListener('change', this._inputHandler);
        this.input.removeEventListener('keydown', this._keydownHandler);
        if (this._selectStartHandler) {
            this.input.removeEventListener('selectstart', this._selectStartHandler);
        }
        if (this.renderAsHtml) {
            this.container.removeEventListener('keydown', this._containerKeydownHandler);
            this.display.removeEventListener('click', this._displayClickHandler);
        }

        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }

        this.container = null;
        this.btnMinus = null;
        this.btnPlus = null;
        this.input = null;
        this.display = null;
        this.onChange = null;
        this.renderValue = null;
    }

    _updateValue(newVal) {
        const sanitized = this._sanitize(newVal);
        this.value = sanitized;
        if (this.renderAsHtml) {
            this.display.innerHTML = this.renderValue(sanitized, this);
        } else {
            this.input.value = this.renderValue(sanitized, this);
        }

        if (typeof this.onChange === 'function') {
            this.onChange(sanitized, this);
        }
    }

    _changeValue(delta) {
        this._updateValue(this.value + delta);
    }

    // Abstract methods to be implemented by subclasses
    _parseInput(inputText) {
        throw new Error('Abstract method _parseInput must be implemented');
    }

    _sanitize(val) {
        throw new Error('Abstract method _sanitize must be implemented');
    }
}

class HpvNumberStepper extends HpvStepperBase {
    constructor(options) {
        super(options);
    }

    _parseInput(inputText) {
        const numeric = parseFloat(inputText.replace(/[^\d.-]/g, ''));
        return isNaN(numeric) ? this.min : numeric;
    }

    _sanitize(val) {
        if (val >= this.min && val <= this.max) return val;
        return Math.max(this.min, Math.min(this.max, val));
    }
}

class HpvListStepper extends HpvStepperBase {
    constructor({
        items = [],
        initialItem,
        keyField = 'id',
        valueField = 'label',
        onChange: userOnChange,
        onCreate: userOnCreate,
        renderValue: userOnRender = (item, index, instance) => item?.[instance.valueField || valueField] || '',
        ...otherOptions
    }) {
        const initialIndex = HpvListStepper._findInitialIndex(initialItem, items, keyField);

        const tempRenderValue = (val) => val.toString();
        const tempOnChange = () => {};
        const tempOnCreate = () => {};

        super({
            ...otherOptions,
            initialValue: initialIndex,
            min: 0,
            max: Math.max(0, items.length - 1),
            stepSize: 1,
            onChange: tempOnChange,
            onCreate: tempOnCreate,
            renderValue: tempRenderValue
        });

        this.items = items;
        this.keyField = keyField;
        this.valueField = valueField;

        const wrappedOnChange = (index, instance) => {
            const item = instance.items[index];
            if (typeof userOnChange === 'function') userOnChange(item, index, instance);
        };

        const wrappedRenderValue = (index, instance) => {
            const item = instance.items[index];
            return userOnRender(item, index, instance);
        };

        this.onChange = wrappedOnChange;
        this.renderValue = wrappedRenderValue;

        // Manually update display for initial render without calling onChange
        if (this.renderAsHtml) {
            this.display.innerHTML = this.renderValue(this.value, this);
        } else {
            this.input.value = this.renderValue(this.value, this);
        }

        // Manually call onCreate
        if (typeof userOnCreate === 'function') {
            const item = this.items[this.value];
            userOnCreate(item, this.value, this);
        }

        // Customize for list mode
        this.btnMinus.textContent = '‹';
        this.btnPlus.textContent = '›';
        this.container.classList.add('list-stepper');
    }

    static _findInitialIndex(initialItem, items, keyField) {
        if (!initialItem) return 0;
        if (typeof initialItem === 'object') {
            const idx = items.findIndex(it => it && it[keyField] === initialItem[keyField]);
            return idx >= 0 ? idx : 0;
        }
        const idx = items.findIndex(it => it && it[keyField] === initialItem);
        return idx >= 0 ? idx : 0;
    }

    _parseInput(inputText) {
        const searchText = inputText.toLowerCase().trim();
        const index = this.items.findIndex(item => {
            const text = String(item?.[this.valueField] || '').toLowerCase();
            return text.includes(searchText);
        });
        return index >= 0 ? index : this.value;
    }

    _sanitize(val) {
        if (this.items === undefined) {
            return Math.max(this.min, Math.min(this.max, val));
        }
        const count = this.items.length;
        if (count === 0) {
            return Math.max(this.min, Math.min(this.max, Math.round(val)));
        }
        return ((Math.round(val) % count) + count) % count;
    }

    // List-specific methods
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

        if (currentItem) {
            const newIndex = this._findIndex(currentItem);
            this.setValue(newIndex);
        } else {
            this.setValue(0);
        }
    }

    _findIndex(value) {
        if (value && typeof value === 'object') {
            const idx = this.items.findIndex(item => item && item[this.keyField] === value[this.keyField]);
            return idx >= 0 ? idx : 0;
        }
        const idx = this.items.findIndex(item => item && item[this.keyField] === value);
        return idx >= 0 ? idx : 0;
    }
}