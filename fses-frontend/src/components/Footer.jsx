import React from 'react';

const Footer = () => {
    return (
        <footer className="footer sm:footer-horizontal footer-center text-base-content p-4">
            <aside>
                <p>Copyright © {new Date().getFullYear()} - Universiti Teknologi Malaysia</p>
            </aside>
        </footer>
    );
};

export default Footer;