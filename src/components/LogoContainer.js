import React from 'react';
import Image from 'next/image'; // 🔑 Import the Next.js Image component

// NOTE: The width and height on the Image component MUST be set to its intended
// display size. Here, we use the values defined in styles.logoWrapper.
const LOGO_SIZE = 50;

function LogoContainer({ style }) {
    return (
        <div style={{ ...styles.logoWrapper, ...style }}>
            {/* 🔑 REPLACED <img> with Next.js <Image /> */}
            <Image
                src="/logo.png"
                alt="Platform Logo"
                width={LOGO_SIZE}      // Required for Next.js Image component
                height={LOGO_SIZE}     // Required for Next.js Image component
                // The styles.logoImage properties (width: '100%', height: '100%', objectFit: 'cover')
                // are often handled implicitly or should be passed via the 'style' prop.
                // Since the Image component has fixed width/height props, we only need objectFit.
                style={{ objectFit: 'cover' }}
                // Note: If you want better performance when scrolling, you could add: priority
                // For a small logo in the header, 'priority' is generally a good idea.
                priority
            />
        </div>
    );
}

const styles = {
    logoWrapper: {
        // Base size and margin for the container
        width: `${LOGO_SIZE}px`, // Using template literal for flexibility
        height: `${LOGO_SIZE}px`,
        borderRadius: '8px',
        marginRight: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4f46e5', // Theme color for placeholder background
        flexShrink: 0, // Prevents container from shrinking in flex layouts
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    // The logoText is unused in the current component, but kept for reference
    logoText: {
        // Placeholder text style
        fontSize: '0.8em',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // The logoImage styles are no longer all necessary, but we can reuse objectFit
    logoImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    }
};

export default LogoContainer;
// import React from 'react';

// // NOTE: You should insert your actual <img> or <Image> component here.
// // For now, it's set up to accept children (like an <img> tag) or display placeholder text.

// function LogoContainer({ style }) {
//     return (
//         <div style={{ ...styles.logoWrapper, ...style }}>
//             {/* 🔑 INSERT YOUR LOGO HERE 
                
//                 Example using a standard HTML <img> tag (assuming your logo is in /public/logo.png):
                
                
//                 Example using a simple text placeholder:
//             */}
            
//             <img src="/logo.png" alt="Platform Logo" style={styles.logoImage} />
//         </div>
//     );
// }

// const styles = {
//     logoWrapper: {
//         // Base size and margin for the container
//         width: '50px',
//         height: '50px',
//         borderRadius: '8px',
//         marginRight: '15px',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         backgroundColor: '#4f46e5', // Theme color for placeholder background
//         flexShrink: 0, // Prevents container from shrinking in flex layouts
//         overflow: 'hidden',
//         boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//     },
//     logoText: {
//         // Placeholder text style
//         fontSize: '0.8em',
//         color: 'white',
//         fontWeight: 'bold',
//         textAlign: 'center',
//     },
//     logoImage: {
//         // Style if you use an actual <img> tag
//         width: '100%',
//         height: '100%',
//         objectFit: 'cover',
//     }
// };

// export default LogoContainer;