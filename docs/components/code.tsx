import React, { useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css"; // pick any theme

interface CodeBlockProps {
    language?: string;
    value: string;
}

const CodeBlock = ({ language, value }: CodeBlockProps) => {
    useEffect(() => {
        hljs.highlightAll();
    }, []);

    return (
        <pre>
            <code className={language ? `language-${language}` : ""}>
                {value}
            </code>
        </pre>
    );
};

export default CodeBlock;