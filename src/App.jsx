import React, {useEffect, useState} from 'react';

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
            [0, 9], [10, 19], [20, 29], [30, 39], [40, 49], [50, 59], [60, 69], [70, 79], [80, 89], [90, 99]
        ];

        if (remainingNumbers.length === 0) return table;

        let remainingForGeneration = [].concat(remainingNumbers)
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
                const value = isEnabled ? getRandomNumberInRange(range[0], range[1], remainingForGeneration) : null;
                remainingForGeneration = isEnabled ? remainingForGeneration.filter(num => num !== value) : remainingForGeneration;
                rowCells.push({value, enabled: isEnabled, shiny: false});
            }
            table.push(rowCells);
        }
        return table;
    }

    // Function to get a random unique number within a given range
    function getRandomNumberInRange(min, max, generatedRemainingNumbers) {
        const possibleNumbers = generatedRemainingNumbers.filter(num => num >= min && num <= max);
        if (possibleNumbers.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * possibleNumbers.length);
        return possibleNumbers[randomIndex];
    }

    // Function to generate a new random number and hide it
    const generateNumber = () => {
        if (remainingNumbers.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
            const number = remainingNumbers[randomIndex];
            setRemainingNumbers(remainingNumbers.filter((_, i) => i !== randomIndex));
            setRandomNumber(number);
            setShowNumber(false);
            updateBingoTable(number);
            return number; // Return the generated number immediately
        }
        return null; // Return null if no numbers are left
    };

    const handleNextNumber = () => {
        const newNumber = generateNumber(); // Immediately generate a new number
        if (newNumber !== null) {
            speakNumber(newNumber); // Speak the new number directly
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

    const headers = [
        '00-09', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99'
    ];

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
                onClick={handleNextNumber}
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
                    {headers.map((header, idx) => (
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
        width: '50vw', // 50% of the viewport width
        maxWidth: '375px', // Maximum width of 375px (half of 750px)
        height: '50vw', // Height equal to width for a square
        maxHeight: '375px',
        backgroundColor: '#4caf50',
        borderRadius: '10px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        marginBottom: '20px',
        cursor: 'pointer',
    },
    number: {
        fontSize: '12vw', // Scales the font size with the viewport width
        maxFontSize: '72px', // Maximum font size for larger screens
        color: '#fff',
        '@media (maxWidth: 600px)': {
            fontSize: '14vw', // Slightly larger font for smaller screens
        },
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
        '@media (maxWidth: 600px)': {
            padding: '8px 16px',
            fontSize: '14px',
            margin: '5px',
        },
    },
    bingoTable: {
        marginTop: '30px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minWidth: '550px',
        maxWidth: '950px',
        border: '2px solid #ccc',
        borderRadius: '10px',
        overflow: 'hidden',
        '@media (maxWidth: 600px)': {
            width: '95%',
            marginTop: '20px',
        },
    },
    row: {
        display: 'flex',
        flexWrap: 'nowrap',
        '@media (maxWidth: 600px)': {
            flexWrap: 'wrap',
        },
    },
    headerCell: {
        flex: '1',
        textAlign: 'center',
        padding: '10px',
        backgroundColor: '#ddd',
        border: '1px solid #ccc',
        fontWeight: 'bold',
        '@media (maxWidth: 600px)': {
            padding: '5px',
            fontSize: '12px',
        },
    },
    cell: {
        flex: '1',
        height: '50px',
        lineHeight: '50px',
        textAlign: 'center',
        border: '1px solid #ccc',
        fontSize: '16px',
        '@media (maxWidth: 600px)': {
            height: '40px',
            lineHeight: '40px',
            fontSize: '14px',
        },
    },
};

export default App;
