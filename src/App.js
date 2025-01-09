import React, {useState, useEffect} from 'react';

function App() {
    const [remainingNumbers, setRemainingNumbers] = useState(generateRemainingNumbers());
    const [randomNumber, setRandomNumber] = useState(null);
    const [showNumber, setShowNumber] = useState(false);
    const [bingoTable, setBingoTable] = useState([]);

    // Function to generate the remaining numbers within the correct ranges
    function generateRemainingNumbers() {
        let numbers = [];
        for (let i = 0; i <= 90; i += 10) {
            for (let j = i; j < i + 10; j++) {
                numbers.push(j);
            }
        }
        return numbers;
    }

    // Function to generate bingo table with 3 rows and 10 columns
    function generateBingoTable() {
        const table = [];
        const ranges = [
            [0, 10], [11, 20], [21, 30], [31, 40], [41, 50],
            [51, 60], [61, 70], [71, 80], [81, 90], [91, 100]
        ];

        // Check if ranges and remainingNumbers are correctly defined
        if (remainingNumbers.length === 0) return table;

        for (let row = 0; row < 3; row++) {
            const rowCells = [];
            const enabledColumns = [];

            // Randomly select 5 columns to be enabled in this row
            while (enabledColumns.length < 5) {
                const randomCol = Math.floor(Math.random() * 10);
                if (!enabledColumns.includes(randomCol)) enabledColumns.push(randomCol);
            }

            // Generate values based on the header ranges and place them in the enabled columns
            for (let col = 0; col < 10; col++) {
                const range = ranges[col];
                const isEnabled = enabledColumns.includes(col);
                const value = isEnabled ? getRandomNumberInRange(range[0], range[1]) : null;
                rowCells.push({value, enabled: isEnabled, shiny: false});
            }
            table.push(rowCells);
        }
        return table;
    }

    // Function to get a random unique number within a given range
    function getRandomNumberInRange(min, max) {
        const possibleNumbers = remainingNumbers.filter(num => num >= min && num <= max);
        if (possibleNumbers.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * possibleNumbers.length);
        const number = possibleNumbers[randomIndex];
        setRemainingNumbers(remainingNumbers.filter(num => num !== number)); // Remove number from remaining pool
        return number;
    }

    // Function to generate a new random number and hide it
    const generateNumber = () => {
        if (remainingNumbers.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
            const number = remainingNumbers[randomIndex];
            setRemainingNumbers(remainingNumbers.filter((_, i) => i !== randomIndex));
            setRandomNumber(number);
            setShowNumber(false);
        }
    };

    // Function to update the bingo table when a new number is generated
    const updateBingoTable = (number) => {
        setBingoTable((prev) =>
            prev.map((row) =>
                row.map((cell) =>
                    cell.value === number && cell.enabled
                        ? {...cell, shiny: false}  // Reset shiny to false initially
                        : cell
                )
            )
        );
    };

    // Function to handle clicking a cell
    const handleCellClick = (cell) => {
        if (cell.enabled && cell.value === randomNumber) {
            setBingoTable((prev) =>
                prev.map((row) =>
                    row.map((currentCell) =>
                        currentCell === cell
                            ? {...currentCell, shiny: true}  // Make cell shiny when clicked
                            : currentCell
                    )
                )
            );
        }
    };

    // Function to speak the number in Portuguese
    const speakNumber = (number = randomNumber) => {
        if (number !== null) {
            const utterance = new SpeechSynthesisUtterance(number.toString());
            utterance.lang = 'pt-PT';
            window.speechSynthesis.speak(utterance);
        }
    };

    // Run generateBingoTable once when the component mounts
    useEffect(() => {
        const newTable = generateBingoTable();
        setBingoTable(newTable);
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.box} onClick={() => setShowNumber(true)}>
                <h1 style={styles.number}>{showNumber ? randomNumber : '?'}</h1>
            </div>
            <button
                style={{
                    ...styles.button,
                    backgroundColor: remainingNumbers.length === 0 ? 'red' : styles.button.backgroundColor
                }}
                onClick={() => generateNumber()}
                disabled={remainingNumbers.length === 0}
            >
                Next Number
            </button>
            <button
                style={{
                    ...styles.button,
                    backgroundColor: remainingNumbers.length === 0 ? 'red' : styles.button.backgroundColor
                }}
                onClick={() => speakNumber()}
                disabled={remainingNumbers.length === 0}
            >
                Play
            </button>
            <div style={styles.bingoTable}>
                <div style={styles.row}>
                    {['0-10', '11-20', '21-30', '31-40', '41-50', '51-60', '61-70', '71-80', '81-90', '91-100'].map((header, idx) => (
                        <div style={styles.headerCell} key={idx}>
                            {header}
                        </div>
                    ))}
                </div>
                {bingoTable.map((row, rowIdx) => (
                    <div style={styles.row} key={rowIdx}>
                        {row.map((cell, colIdx) => (
                            <div
                                key={colIdx}
                                style={{
                                    ...styles.cell,
                                    backgroundColor: cell.shiny ? 'yellow' : cell.enabled ? '#4caf50' : '#ccc', // Highlight enabled cells when clicked
                                    cursor: cell.enabled ? 'pointer' : 'not-allowed',
                                }}
                                onClick={() => handleCellClick(cell)}
                            >
                                {cell.value !== null ? cell.value : ''}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f9f9f9',
    },
    box: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '200px',
        height: '200px',
        backgroundColor: '#4caf50',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        marginBottom: '20px',
        cursor: 'pointer',
    },
    number: {
        fontSize: '48px',
        color: '#fff',
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#007bff',
        border: 'none',
        borderRadius: '5px',
        margin: '10px',
        cursor: 'pointer',
    },
    bingoTable: {
        marginTop: '30px',
        display: 'flex',
        flexDirection: 'column',
        width: '80%',
        maxWidth: '600px',
        border: '2px solid #ccc',
        borderRadius: '10px',
        overflow: 'hidden',
    },
    row: {
        display: 'flex',
    },
    headerCell: {
        flex: '1',
        textAlign: 'center',
        padding: '10px',
        backgroundColor: '#ddd',
        border: '1px solid #ccc',
        fontWeight: 'bold',
    },
    cell: {
        flex: '1',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        border: '1px solid #ccc',
        fontSize: '16px',
    },
};

export default App;
