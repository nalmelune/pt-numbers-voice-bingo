import React, {useEffect, useState} from 'react';

function App() {
    const [remainingNumbers, setRemainingNumbers] = useState(generateRemainingNumbers());
    const [randomNumber, setRandomNumber] = useState(null);
    const [showNumber, setShowNumber] = useState(false);
    const [bingoTable, setBingoTable] = useState([]);
    const [hasWon, setHasWon] = useState(false);

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

    // Check win condition when bingo table updates
    const checkWinCondition = () => {
        const allShiny = bingoTable.every(row =>
            row.every(cell =>
                !cell.enabled || (cell.enabled && cell.shiny)
            )
        );
        setHasWon(allShiny);
    };

    // Function to generate a new random number and hide it
    const generateNumber = () => {
        if (remainingNumbers.length > 0) {
            const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
            const number = remainingNumbers[randomIndex];
            setRemainingNumbers(remainingNumbers.filter((_, i) => i !== randomIndex));
            setRandomNumber(number);
            setShowNumber(false);
            updateBingoTable(number);
            return number;
        }
        return null;
    };

    const handleNextNumber = () => {
        const newNumber = generateNumber();
        if (newNumber !== null) {
            speakNumber(newNumber);
        }
    };

    // Function to update the bingo table when a new number is generated
    const updateBingoTable = (number) => {
        setBingoTable((prev) =>
            prev.map((row) =>
                row.map((cell) =>
                    cell.value === number && cell.enabled
                        ? {...cell, shiny: false}
                        : cell
                )
            )
        );
    };

    // Function to handle clicking a cell
    const handleCellClick = (cell) => {
        if (cell.enabled && cell.value === randomNumber && !hasWon) {
            setBingoTable((prev) =>
                prev.map((row) =>
                    row.map((currentCell) =>
                        currentCell === cell
                            ? {...currentCell, shiny: true}
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

    // Check win condition when bingo table changes
    useEffect(() => {
        checkWinCondition();
    }, [bingoTable]);

    useEffect(() => {
        const newTable = generateBingoTable();
        setBingoTable(newTable);

        // Expose setHasWon to trigger win condition
        window.setHasWon = setHasWon;
    }, []);

    const headers = [
        '00-09', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99'
    ];

    return (
        <div style={styles.container}>
            {hasWon && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    animation: 'fadeIn 0.5s ease-in'
                }}>
                    <div style={{
                        fontSize: '4rem',
                        color: '#ffd700',
                        textAlign: 'center',
                        textShadow: '0 0 20px #ffd700',
                        animation: 'pulse 2s infinite',
                        padding: '2rem',
                        background: 'linear-gradient(45deg, #8a2be2, #4b0082)',
                        borderRadius: '20px',
                        border: '4px solid #ffd700',
                        boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)'
                    }}>
                        🎉 BINGO! VICTORY! 🎉
                        <div style={{
                            fontSize: '1.5rem',
                            marginTop: '1rem',
                            color: 'white'
                        }}>
                            All numbers matched!
                        </div>
                    </div>
                    <div style={{
                        marginTop: '2rem',
                        fontSize: '2rem',
                        color: '#fff',
                        animation: 'float 3s ease-in-out infinite'
                    }}>
                        🎊🥳🎈
                    </div>
                </div>
            )}
            <div style={styles.box} onClick={() => setShowNumber(true)}>
                <h1 style={styles.number}>{showNumber ? randomNumber : '?'}</h1>
            </div>
            <button
                style={{
                    ...styles.button,
                    backgroundColor: remainingNumbers.length === 0 ? 'red' : styles.button.backgroundColor
                }}
                onClick={handleNextNumber}
                disabled={remainingNumbers.length === 0 || hasWon}
            >
                Next Number
            </button>
            <button
                style={{
                    ...styles.button,
                    backgroundColor: styles.button.backgroundColor
                }}
                onClick={() => speakNumber()}
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
                                    backgroundColor: cell.shiny ? 'yellow' : cell.enabled ? '#4caf50' : '#ccc',
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
        padding: '2px',
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
    '@keyframes pulse': {
        '0%': {transform: 'scale(1)', opacity: 1},
        '50%': {transform: 'scale(1.05)', opacity: 0.9},
        '100%': {transform: 'scale(1)', opacity: 1}
    },
    '@keyframes fadeIn': {
        '0%': {opacity: 0},
        '100%': {opacity: 1}
    },
    '@keyframes float': {
        '0%': {transform: 'translateY(0px)'},
        '50%': {transform: 'translateY(-20px)'},
        '100%': {transform: 'translateY(0px)'}
    }
};

export default App;
