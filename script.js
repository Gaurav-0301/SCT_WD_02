document.addEventListener('DOMContentLoaded', () => {
    const currentDisplay = document.getElementById('current-display');
    const previousDisplay = document.getElementById('previous-operand');
    const buttons = document.querySelectorAll('.btn');

    let currentInput = '0';
    let previousInput = '';
    let operation = undefined;
    let shouldResetScreen = false;

    // Secret code tracker combination layout arrays
    let secretComboSequence = [];
    const targetCombo = ['7', '8', '9'];

    function updateDisplay() {
        currentDisplay.innerText = formatNumber(currentInput);
        
        // Strip bold typography rules during normal execution path updates
        if (currentInput !== 'RCB') {
            currentDisplay.classList.remove('rcb-bold-text');
        }

        if (operation != null) {
            previousDisplay.innerText = `${formatNumber(previousInput)} ${getOperatorSymbol(operation)}`;
        } else {
            previousDisplay.innerText = '';
        }
    }

    function formatNumber(number) {
        if (number === 'RCB') return 'RCB';
        if (number === 'Error' || number === 'Infinity') return number;
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[1] ? stringNumber.split('.')[0] : stringNumber);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        
        if (isNaN(integerDigits)) {
            integerDisplay = '0';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    function getOperatorSymbol(op) {
        if (op === '*') return '×';
        if (op === '/') return '÷';
        return op;
    }

    // Interactive Code Combo Tracker Trigger Logic
    function checkSecretCombo(key) {
        secretComboSequence.push(key.toString());
        
        if (secretComboSequence.length > targetCombo.length) {
            secretComboSequence.shift();
        }

        if (JSON.stringify(secretComboSequence) === JSON.stringify(targetCombo)) {
            triggerRcbDisplay();
            return true;
        }
        return false;
    }

    function triggerRcbDisplay() {
        currentInput = 'RCB';
        currentDisplay.innerText = 'RCB';
        currentDisplay.classList.add('rcb-bold-text');
        previousDisplay.innerText = '🏆 PLAY BOLD';
        shouldResetScreen = true;
        secretComboSequence = []; 
    }

    function appendNumber(number) {
        if (number === '.' && currentInput.includes('.')) return;
        if ((currentInput === '0' && number !== '.') || shouldResetScreen || currentInput === 'Error' || currentInput === 'RCB') {
            currentInput = number.toString();
            shouldResetScreen = false;
        } else {
            currentInput = currentInput.toString() + number.toString();
        }
    }

    function chooseOperation(op) {
        if (currentInput === 'Error' || currentInput === 'RCB') return;
        if (previousInput !== '') {
            compute();
        }
        operation = op;
        previousInput = currentInput;
        shouldResetScreen = true;
    }

    function compute() {
        if (currentInput === 'RCB') return;
        let computation;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        if (isNaN(prev) || isNaN(current)) return;

        switch (operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '*': computation = prev * current; break;
            case '/': 
                computation = current === 0 ? 'Error' : prev / current; 
                break;
            case '%': computation = (prev / 100) * current; break;
            default: return;
        }

        if (typeof computation === 'number') {
            computation = Math.round(computation * 100000000) / 100000000;
        }

        currentInput = computation.toString();
        operation = undefined;
        previousInput = '';
    }

    function clear() {
        currentInput = '0';
        previousInput = '';
        operation = undefined;
        secretComboSequence = [];
    }

    function deleteNumber() {
        if (currentInput === 'Error' || currentInput === 'Infinity' || currentInput === 'RCB') {
            clear();
            return;
        }
        if (currentInput.toString().length === 1) {
            currentInput = '0';
        } else {
            currentInput = currentInput.toString().slice(0, -1);
        }
    }

    // --- GUI Click Listeners ---
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');
            const action = button.getAttribute('data-action');

            if (value) {
                const isComboTriggered = checkSecretCombo(value);
                if (isComboTriggered) return;

                if (['+', '-', '*', '/', '%'].includes(value)) {
                    chooseOperation(value);
                } else {
                    appendNumber(value);
                }
                updateDisplay();
            } else if (action) {
                if (action === 'clear') clear();
                if (action === 'delete') deleteNumber();
                if (action === 'calculate') compute();
                updateDisplay();
            }
        });
    });

    // --- Keyboard Event Handling Rules ---
    window.addEventListener('keydown', (e) => {
        if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
            const isComboTriggered = checkSecretCombo(e.key);
            if (isComboTriggered) return;
            appendNumber(e.key);
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '%') {
            chooseOperation(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            compute();
        } else if (e.key === 'Backspace') {
            deleteNumber();
        } else if (e.key === 'Escape') {
            clear();
        }
        updateDisplay();
    });
});