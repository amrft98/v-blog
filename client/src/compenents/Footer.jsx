import React from "react";
import "./footer.css"
function Footer() {
  const year = new Date().getFullYear();
  return (<div className="foot-container">
    <footer>
      <p>Copyright ⓒ {year}</p>
    </footer>
    </div>
  );
}

export default Footer;
