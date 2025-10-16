import React from 'react';

// NOTE: You should insert your actual <img> or <Image> component here.
// For now, it's set up to accept children (like an <img> tag) or display placeholder text.

function LogoContainer({ style }) {
    return (
        <div style={{ ...styles.logoWrapper, ...style }}>
            {/* 🔑 INSERT YOUR LOGO HERE 
                
                Example using a standard HTML <img> tag (assuming your logo is in /public/logo.png):
                
                
                Example using a simple text placeholder:
            */}
            
            <img src="/logo.png" alt="Platform Logo" style={styles.logoImage} />
        </div>
    );
}

const styles = {
    logoWrapper: {
        // Base size and margin for the container
        width: '50px',
        height: '50px',
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
    logoText: {
        // Placeholder text style
        fontSize: '0.8em',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    logoImage: {
        // Style if you use an actual <img> tag
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    }
};

export default LogoContainer;