import React from "react";

const CodeSnippet: React.FC = () => {
  return (
    <pre className="code-block text-sm md:text-base w-full max-w-md">
      <code>
        <span className="syntax-keyword">import</span>{" "}
        <span className="syntax-string">'@/styles/global.css'</span>;<br />
        <br />
        <span className="syntax-keyword">function</span>{" "}
        <span className="syntax-function">CodeCollab</span>() {"{"}
        <br />
        &nbsp;&nbsp;<span className="syntax-keyword">const</span> [
        <span className="syntax-function">room</span>,{" "}
        <span className="syntax-function">setRoom</span>] =
        <span className="syntax-function">useState</span>(
        <span className="syntax-string">''</span>);
        <br />
        &nbsp;&nbsp;<span className="syntax-keyword">const</span> [
        <span className="syntax-function">user</span>,{" "}
        <span className="syntax-function">setUser</span>] =
        <span className="syntax-function">useState</span>(
        <span className="syntax-string">''</span>);
        <br />
        <br />
        &nbsp;&nbsp;
        <span className="syntax-comment">// Join collaboration session</span>
        <br />
        &nbsp;&nbsp;<span className="syntax-keyword">const</span>{" "}
        <span className="syntax-function">joinSession</span> = () {"=> {"}
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="syntax-function">connect</span>
        ({"{"}room, user{"}"});
        <br />
        &nbsp;&nbsp;{"}"}
        <br />
        <br />
        &nbsp;&nbsp;<span className="syntax-keyword">return</span> (<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&lt;
        <span className="syntax-function">Button</span>
        <span className="syntax-function">onClick</span>={"{"}joinSession{"}"}
        &gt;
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Let's Code Together
        <span className="animate-text-blink">_</span>
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&lt;/
        <span className="syntax-function">Button</span>&gt;
        <br />
        &nbsp;&nbsp;);
        <br />
        {"}"}
        <br />
      </code>
    </pre>
  );
};

export default CodeSnippet;
