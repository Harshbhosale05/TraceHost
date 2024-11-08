//code 1
// // import React, { useState } from 'react';
// // import axios from 'axios';

// // const DomainChecker = () => {
// //     const [domain, setDomain] = useState('');
// //     const [result, setResult] = useState(null);
// //     const [error, setError] = useState('');

// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         setError('');
// //         setResult(null);

// //         try {
// //             const response = await axios.get(`http://localhost:8000/checker/check/?domain=${domain}`);
// //             setResult(response.data);
// //         } catch (err) {
// //             setError('Error fetching data. Please check the domain or try again.');
// //         }
// //     };

// //     const formatResult = (data) => {
// //         if (!data || typeof data !== 'object') return null;

// //         return Object.entries(data).map(([key, value]) => (
// //             <tr key={key}>
// //                 <td style={styles.resultKey}>{key}</td>
// //                 <td style={styles.resultValue}>
// //                     {typeof value === 'object' ? JSON.stringify(value, null, 2) : value || 'N/A'}
// //                 </td>
// //             </tr>
// //         ));
// //     };

// //     return (
// //         <div style={styles.container}>
// //             <h1 style={styles.header}>Domain Checker</h1>
// //             <form onSubmit={handleSubmit} style={styles.form}>
// //                 <input 
// //                     type="text" 
// //                     value={domain} 
// //                     onChange={(e) => setDomain(e.target.value)} 
// //                     placeholder="Enter domain name" 
// //                     required 
// //                     style={styles.input}
// //                 />
// //                 <button type="submit" style={styles.button}>Check</button>
// //             </form>

// //             {error && <p style={styles.errorMessage}>{error}</p>}

// //             {result && (
// //                 <div style={styles.resultContainer}>
// //                     <h2 style={styles.subHeader}>Domain Information</h2>
// //                     <table style={styles.resultTable}>
// //                         <tbody>
// //                             {formatResult(result)}
// //                         </tbody>
// //                     </table>
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };

// // // Inline CSS styles
// // const styles = {
// //     container: {
// //         width: '50%',
// //         margin: '0 auto',
// //         textAlign: 'center',
// //         fontFamily: 'Arial, sans-serif',
// //     },
// //     header: {
// //         marginBottom: '20px',
// //         color: '	#009fff',
        
// //     },
// //     form: {
// //         display: 'flex',
// //         justifyContent: 'center',
// //         marginBottom: '20px',
// //     },
// //     input: {
// //         padding: '10px',
// //         width: '60%',
// //         borderRadius: '5px',
// //         border: '2px solid #ccc',
// //         fontSize: '16px',
// //         marginRight: '10px',
// //         transition: 'border-color 0.3s ease-in-out',
// //     },
// //     button: {
// //         padding: '10px 20px',
// //         backgroundColor: '#007bff',
// //         color: '#fff',
// //         border: 'none',
// //         borderRadius: '5px',
// //         cursor: 'pointer',
// //         fontSize: '16px',
// //     },
// //     inputFocus: {
// //         borderColor: '#007bff',
// //     },
// //     errorMessage: {
// //         color: 'red',
// //     },
// //     resultContainer: {
// //         marginTop: '20px',
// //         textAlign: 'left',
// //     },
// //     subHeader: {
// //         color: '#333',
// //     },
// //     resultTable: {
// //         width: '100%',
// //         borderCollapse: 'collapse',
// //     },
// //     resultKey: {
// //         textAlign: 'left',
// //         padding: '10px',
// //         borderBottom: '1px solid #ccc',
// //         fontWeight: 'bold',
// //         width: '30%',
// //         //top align
// //         verticalAlign: 'top',
// //     },
// //     resultValue: {
// //         padding: '10px',
// //         borderBottom: '1px solid #ccc',
// //         textAlign: 'left',
// //         width: '70%',
// //         whiteSpace: 'pre-wrap', // This ensures multiline text is readable

// //     },
// // };

// // export default DomainChecker;




// // code 2
// import React, { useState } from 'react';
// import axios from 'axios';

// // Main DomainChecker Component
// const DomainChecker = () => {
//     const [domain, setDomain] = useState('');
//     const [result, setResult] = useState(null);
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false); // Loading state for the loader

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setResult(null);
//         setLoading(true); // Start loading

//         try {
//             const response = await axios.get(`http://localhost:8000/checker/check/?domain=${domain}`);
//             setResult(response.data);
//         } catch (err) {
//             setError('Error fetching data. Please check the domain or try again.');
//         } finally {
//             setLoading(false); // Stop loading
//         }
//     };

//     const formatResult = (data) => {
//         if (!data || typeof data !== 'object') return null;

//         return Object.entries(data).map(([key, value]) => (
//             <tr key={key}>
//                 <td style={styles.resultKey}>{key}</td>
//                 <td style={styles.resultValue}>
//                     {typeof value === 'object' ? JSON.stringify(value, null, 2) : value || 'N/A'}
//                 </td>
//             </tr>
//         ));
//     };

//     return (
//         <div style={styles.container}>
//             <header style={styles.header}>
//                 <h1 style={styles.title}>TraceHost</h1>
//                 <p style={styles.subtitle}>Domain Certificate & Information Checker</p>
//             </header>

//             <form onSubmit={handleSubmit} style={styles.form}>
//                 <input 
//                     type="text" 
//                     value={domain} 
//                     onChange={(e) => setDomain(e.target.value)} 
//                     placeholder="Enter domain name" 
//                     required 
//                     style={styles.input}
//                 />
//                 <button type="submit" style={styles.button}>Check</button>
//             </form>

//             {loading && (
//                 <div style={styles.loaderContainer}>
//                     <p style={styles.loaderText}>Analyzing...</p>
//                 </div>
//             )}

//             {error && <p style={styles.errorMessage}>{error}</p>}

//             {result && !loading && (
//                 <div style={styles.resultContainer}>
//                     <h2 style={styles.subHeader}>Domain Information</h2>
//                     <table style={styles.resultTable}>
//                         <tbody>
//                             {formatResult(result)}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// };

// // Inline CSS styles including the loader animation
// const styles = {
//     container: {
//         width: '90%',
//         maxWidth: '800px',
//         margin: '0 auto',
//         padding: '20px',
//         textAlign: 'center',
//         fontFamily: "'Roboto', sans-serif",
//         backgroundColor: '#f9f9f9',
//         borderRadius: '8px',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//     },
//     header: {
//         marginBottom: '20px',
//         background: 'linear-gradient(135deg, #007bff 0%, #009fff 100%)',
//         padding: '20px',
//         borderRadius: '8px',
//         color: '#fff',
//     },
//     title: {
//         fontSize: '36px',
//         fontWeight: '700',
//         margin: '0 0 10px',
//     },
//     subtitle: {
//         fontSize: '18px',
//         fontWeight: '400',
//         margin: '0',
//     },
//     form: {
//         display: 'flex',
//         justifyContent: 'center',
//         marginBottom: '20px',
//     },
//     input: {
//         padding: '12px',
//         width: '60%',
//         borderRadius: '30px 0 0 30px',
//         border: '2px solid #ccc',
//         fontSize: '16px',
//         marginRight: '-1px',
//         transition: 'border-color 0.3s ease-in-out',
//         outline: 'none',
//     },
//     button: {
//         padding: '12px 24px',
//         backgroundColor: '#007bff',
//         color: '#fff',
//         border: '2px solid #007bff',
//         borderRadius: '0 30px 30px 0',
//         cursor: 'pointer',
//         fontSize: '16px',
//         transition: 'background-color 0.3s ease-in-out',
//         outline: 'none',
//     },
//     errorMessage: {
//         color: 'red',
//     },
//     loaderContainer: {
//         marginTop: '20px',
//     },
//     loaderText: {
//         fontSize: '20px',
//         fontWeight: '600',
//         color: '#007bff',
//         animation: 'flash 1s linear infinite',
//     },
//     '@keyframes flash': {
//         '0%': { opacity: 1 },
//         '50%': { opacity: 0.5 },
//         '100%': { opacity: 1 },
//     },
//     resultContainer: {
//         marginTop: '30px',
//         textAlign: 'left',
//     },
//     subHeader: {
//         color: '#333',
//         fontSize: '24px',
//         marginBottom: '10px',
//     },
//     resultTable: {
//         width: '100%',
//         borderCollapse: 'collapse',
//         backgroundColor: '#fff',
//         borderRadius: '8px',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
//     },
//     resultKey: {
//         textAlign: 'left',
//         padding: '12px',
//         borderBottom: '1px solid #eee',
//         fontWeight: 'bold',
//         backgroundColor: '#f7f7f7',
//         width: '40%',
//         verticalAlign: 'top',
//     },
//     resultValue: {
//         padding: '12px',
//         borderBottom: '1px solid #eee',
//         textAlign: 'left',
//         width: '60%',
//         whiteSpace: 'pre-wrap',
//         wordWrap: 'break-word',
//     },
// };

// export default DomainChecker;





// code 3

// import React, { useState } from 'react';
// import axios from 'axios';

// // Main DomainChecker Component
// const DomainChecker = () => {
//     const [domain, setDomain] = useState('');
//     const [result, setResult] = useState(null);
//     const [error, setError] = useState('');
//     const [loading, setLoading] = useState(false); // Loading state for the loader

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         setResult(null);
//         setLoading(true); // Start loading

//         try {
//             const response = await axios.get(`http://localhost:8000/checker/check/?domain=${domain}`);
//             setResult(response.data);
//         } catch (err) {
//             setError('Error fetching data. Please check the domain or try again.');
//         } finally {
//             setLoading(false); // Stop loading
//         }
//     };

//     const formatResult = (data) => {
//         if (!data || typeof data !== 'object') return null;

//         return Object.entries(data).map(([key, value]) => (
//             <tr key={key}>
//                 <td style={styles.resultKey}>
//                     {key === 'SSL' && <i className="fas fa-lock" style={styles.icon}></i>}
//                     {key === 'IP' && <i className="fas fa-globe" style={styles.icon}></i>}
//                     {key === 'Hosting' && <i className="fas fa-server" style={styles.icon}></i>}
//                     {key}:
//                 </td>
//                 <td style={styles.resultValue}>
//                     {typeof value === 'object' ? JSON.stringify(value, null, 2) : value || 'N/A'}
//                 </td>
//             </tr>
//         ));
//     };

//     return (
//         <div style={styles.container}>
//             <header style={styles.header}>
//                 <h1 style={styles.title}>TraceHost</h1>
//                 <p style={styles.subtitle}>Illegal Domain Detection & Host Identification</p>
//             </header>

//             <form onSubmit={handleSubmit} style={styles.form}>
//                 <input 
//                     type="text" 
//                     value={domain} 
//                     onChange={(e) => setDomain(e.target.value)} 
//                     placeholder="Enter domain name" 
//                     required 
//                     style={styles.input}
//                 />
//                 <button type="submit" style={styles.button}>Analyze</button>
//             </form>

//             {loading && (
//                 <div style={styles.loaderContainer}>
//                     <div style={styles.spinner}></div>
//                     <p style={styles.loaderText}>Analyzing...</p>
//                 </div>
//             )}

//             {error && <p style={styles.errorMessage}>{error}</p>}

//             {result && !loading && (
//                 <div style={styles.resultContainer}>
//                     <h2 style={styles.subHeader}>Domain Information</h2>
//                     <table style={styles.resultTable}>
//                         <tbody>
//                             {formatResult(result)}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// };

// // Inline CSS styles including new spinner loader and dark mode
// // const styles = {
// //     container: {
// //         width: '90%',
// //         maxWidth: '800px',
// //         margin: '0 auto',
// //         padding: '20px',
// //         textAlign: 'center',
// //         fontFamily: "'Roboto', sans-serif",
// //         backgroundColor: '#1e1e2f',
// //         borderRadius: '8px',
// //         color: '#fff',
// //         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
// //     },
// // Inline CSS styles including new spinner loader and dark mode
// const styles = {
//     container: {
//         width: '90%',
//         maxWidth: '800px',
//         margin: '0 auto',
//         padding: '20px',
//         textAlign: 'center',
//         fontFamily: "'Roboto', sans-serif",
//         backgroundImage: 'url("Background.jpeg")', // Add your image here
//         backgroundSize: 'cover', // Cover the whole container
//         backgroundPosition: 'center', // Center the image
//         backgroundRepeat: 'no-repeat', // Prevent the image from repeating
//         borderRadius: '8px',
//         color: '#fff',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
//     },
//     // ... other styles remain unchanged


// // Remember to update your image path

//     header: {
//         marginBottom: '20px',
//         background: 'linear-gradient(135deg, #00264d 0%, #004080 100%)',
//         padding: '20px',
//         borderRadius: '8px',
//         color: '#fff',
//     },
//     title: {
//         fontSize: '36px',
//         fontWeight: '700',
//         margin: '0 0 10px',
//         color: '#ffc107',
//     },
//     subtitle: {
//         fontSize: '18px',
//         fontWeight: '400',
//         margin: '0',
//         color: '#fff',
//     },
//     form: {
//         display: 'flex',
//         justifyContent: 'center',
//         marginBottom: '20px',
//     },
//     input: {
//         padding: '12px',
//         width: '60%',
//         borderRadius: '30px 0 0 30px',
//         border: '2px solid #ccc',
//         fontSize: '16px',
//         marginRight: '-1px',
//         transition: 'border-color 0.3s ease-in-out',
//         outline: 'none',
//     },
//     button: {
//         padding: '12px 24px',
//         backgroundColor: '#ffc107',
//         color: '#fff',
//         border: '2px solid #ffc107',
//         borderRadius: '0 30px 30px 0',
//         cursor: 'pointer',
//         fontSize: '16px',
//         transition: 'background-color 0.3s ease-in-out',
//         outline: 'none',
//     },
//     loaderContainer: {
//         marginTop: '20px',
//     },
//     loaderText: {
//         fontSize: '20px',
//         fontWeight: '600',
//         color: '#ffc107',
//         marginTop: '10px',
//     },
//     spinner: {
//         border: '6px solid #ccc',
//         borderTop: '6px solid #ffc107',
//         borderRadius: '50%',
//         width: '40px',
//         height: '40px',
//         animation: 'spin 1s linear infinite',
//     },
//     '@keyframes spin': {
//         '0%': { transform: 'rotate(0deg)' },
//         '100%': { transform: 'rotate(360deg)' },
//     },
//     errorMessage: {
//         color: 'red',
//     },
//     resultContainer: {
//         marginTop: '30px',
//         textAlign: 'left',
//     },
//     subHeader: {
//         color: '#ffc107',
//         fontSize: '24px',
//         marginBottom: '10px',
//     },
//     resultTable: {
//         width: '100%',
//         borderCollapse: 'collapse',
//         backgroundColor: '#2c2c3e',
//         borderRadius: '8px',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
//     },
//     resultKey: {
//         textAlign: 'left',
//         padding: '12px',
//         borderBottom: '1px solid #555',
//         fontWeight: 'bold',
//         backgroundColor: '#3a3a4f',
//         color: '#ffc107',
//         width: '40%',
//         verticalAlign: 'top',
//     },
//     resultValue: {
//         padding: '12px',
//         borderBottom: '1px solid #555',
//         textAlign: 'left',
//         width: '60%',
//         color: '#fff',
//           whiteSpace: 'pre-wrap',
//         // wordWrap: 'break-word',
//         //whiteSpace: 'normal', // Ensures text wraps naturally
//         wordWrap: 'break-word', // Forces long words to break
//         overflowWrap: 'break-word', // Ensures overflow words wrap
//         maxWidth: '100%', // Prevents text from overflowing the container
//         wordBreak: 'break-all', // Breaks long words at any point
//     },
//     icon: {
//         marginRight: '10px',
//         color: '#ffc107',
//     },


// };

// export default DomainChecker;




// full styled code
import React, { useState } from 'react';
import axios from 'axios';
import backgroundImage from './Background.jpeg';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Main DomainChecker Component
const DomainChecker = () => {
    const [domain, setDomain] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Loading state for the loader

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true); // Start loading

        try {
            const response = await axios.get(`http://localhost:8000/checker/check/?domain=${domain}`);
            setResult(response.data);
        } catch (err) {
            setError('Error fetching data. Please check the domain or try again.');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const formatResult = (data) => {
        if (!data || typeof data !== 'object') return null;

        return Object.entries(data).map(([key, value]) => (
            <tr key={key}>
                <td style={styles.resultKey}>
                    {key === 'SSL' && <i className="fas fa-lock" style={styles.icon}></i>}
                    {key === 'IP' && <i className="fas fa-globe" style={styles.icon}></i>}
                    {key === 'Hosting' && <i className="fas fa-server" style={styles.icon}></i>}
                    {key}:
                </td>
                <td style={styles.resultValue}>
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : value || 'N/A'}
                </td>
            </tr>
        ));
    };

    const downloadPDF = async () => {
        const pdf = new jsPDF('p', 'pt', 'a4');
        const resultContainer = document.getElementById('resultContainer');

        // Ensure the result container has content before capturing
        if (!resultContainer) {
            alert('No content available to download.');
            return;
        }

        // Use a timeout to ensure the content is rendered
        setTimeout(async () => {
            const canvas = await html2canvas(resultContainer, { scale: 2 });
            const imgData = canvas.toDataURL('image/png'); // Use PNG format for better quality

            const imgWidth = 595.28; // A4 width in points
            const pageHeight = 841.89; // A4 height in points
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;

            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight); // Use PNG format
            heightLeft -= pageHeight;

            // Add more pages if necessary
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight); // Use PNG format
                heightLeft -= pageHeight;
            }

            pdf.save('domain_info.pdf');
        }, 1000); // Delay of 1000ms to ensure rendering
    };

    return (
        <div style={styles.pageContainer}> {/* Full-page background */}
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>TraceHost</h1>
                    <p style={styles.subtitle}>Illegal Domain Detection & Host Identification</p>
                </header>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input 
                        type="text" 
                        value={domain} 
                        onChange={(e) => setDomain(e.target.value)} 
                        placeholder="Enter domain name" 
                        required 
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Analyze</button>
                </form>

                {loading && (
                    <div style={styles.loaderContainer}>
                        <div style={styles.spinner}></div>
                        <p style={styles.loaderText}>Analyzing...</p>
                    </div>
                )}

                {error && <p style={styles.errorMessage}>{error}</p>}

                {result && !loading && (
                    <div style={styles.resultContainer} id="resultContainer">
                        <h2 style={styles.subHeader}>Domain Information</h2>
                        <button onClick={downloadPDF} style={styles.downloadButton}>Download PDF</button>
                        <table style={styles.resultTable}>
                            <tbody>
                                {formatResult(result)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

// Styles
const styles = {
    pageContainer: {
        width: '100vw',
        height: '100vh',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxWidth: '2000px',
        margin: '0 auto',
        padding: '20px',
        textAlign: 'center',
        fontFamily: "'Roboto', sans-serif",
        backgroundColor: 'rgba(30, 30, 47, 0.8)', // Semi-transparent background
        borderRadius: '8px',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        overflowY: 'auto', // Allow scrolling if content is too long
        maxHeight: '80vh', // Limit the height for better visibility
    },
    header: {
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #00264d 0%, #004080 100%)',
        padding: '20px',
        borderRadius: '8px',
        color: '#fff',
    },
    title: {
        fontSize: '36px',
        fontWeight: '700',
        margin: '0 0 10px',
        color: '#ffc107',
    },
    subtitle: {
        fontSize: '18px',
        fontWeight: '400',
        margin: '0',
        color: '#fff',
    },
    form: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
    },
    input: {
        padding: '12px',
        width: '60%',
        borderRadius: '30px 0 0 30px',
        border: '2px solid #ccc',
        fontSize: '16px',
        marginRight: '-1px',
        transition: 'border-color 0.3s ease-in-out',
        outline: 'none',
    },
    button: {
        padding: '12px 24px',
        backgroundColor: '#ffc107',
        color: '#fff',
        border: '2px solid #ffc107',
        borderRadius: '0 30px 30px 0',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease-in-out',
        outline: 'none',
    },
    loaderContainer: {
        marginTop: '20px',
    },
    loaderText: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#ffc107',
        marginTop: '10px',
    },
    spinner: {
        border: '6px solid #ccc',
        borderTop: '6px solid #ffc107',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
    },
    errorMessage: {
        color: 'red',
    },
    resultContainer: {
        marginTop: '30px',
        textAlign: 'left',
    },
    subHeader: {
        color: '#ffc107',
        fontSize: '24px',
        marginBottom: '10px',
    },
    resultTable: {
        width: '100%',
        borderCollapse: 'collapse',
        backgroundColor: '#2c2c3e',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    },
    resultKey: {
        textAlign: 'left',
        padding: '12px',
        borderBottom: '1px solid #555',
        fontWeight: 'bold',
        backgroundColor: '#3a3a4f',
        color: '#ffc107',
        width: '25%',
        verticalAlign: 'top',
    },
    resultValue: {
        padding: '12px',
        borderBottom: '1px solid #555',
        textAlign: 'left',
        width: '75%',
        color: '#fff',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%',
        wordBreak: 'break-all',
    },
    icon: {
        marginRight: '10px',
        color: '#ffc107',
    },
    downloadButton: {
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#ffc107',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease-in-out',
    },
};

// Spin Animation
const spinKeyframes = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

// Append spin animation to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = spinKeyframes;
document.head.appendChild(styleSheet);

export default DomainChecker;

