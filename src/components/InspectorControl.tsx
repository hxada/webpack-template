import React from "react";
import "./InspectorControl.css"

export default function InsepctorControl({ onClick, isOpen }) {
    return (
        <div id="control" onClick={onClick}>
            {isOpen ? '\u{25b6}' : '\u{25c0}'}
        </div>
    );
}