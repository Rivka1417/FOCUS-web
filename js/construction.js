        const codeLines = [
            "// Loading Focus Engine v2.4...\n",
            "import { FocusMatrix, AnimationController } from 'focus-core';\n\n",
            "const gameConfiguration = {\n",
            "    difficulty: 'High_Focus',\n",
            "    frameRate: 60,\n",
            "    antiDistractionShield: true,\n",
            "    motivationalQuotesEnabled: true\n",
            "};\n\n",
            "function initializeGameLobby() {\n",
            "    console.log('Synchronizing with user mood selection...');\n",
            "    let focusLevel = FocusMatrix.getOptimalPerformance();\n",
            "    if (focusLevel < 100) {\n",
            "        FocusMatrix.injectInspirationalSentence();\n",
            "    }\n",
            "    return new Promise((resolve) => setTimeout(resolve, 1500));\n",
            "}\n\n",
            "class GameBrain extends FocusMatrix {\n",
            "    constructor() {\n",
            "        super(gameConfiguration);\n",
            "        this.state = 'UNDER_CONSTRUCTION';\n",
            "    }\n",
            "    compileLogic() {\n",
            "        this.buildUserInterface();\n",
            "        this.applySmoothHoverAnimations();\n",
            "    }\n",
            "}\n\n",
            "// Rendering new loops... Success!\n",
            "const brain = new GameBrain();\n",
            "brain.compileLogic();\n"
        ];

        let currentLine = 0;
        let currentChar = 0;
        const codeSpace = document.getElementById('codeSpace');

        function typeCode() {
            if (currentLine < codeLines.length) {
                if (currentChar < codeLines[currentLine].length) {
                    codeSpace.innerHTML += codeLines[currentLine].charAt(currentChar);
                    currentChar++;
                    
                    setTimeout(typeCode, Math.random() * 20 + 10);
                } else {
                    currentLine++;
                    currentChar = 0;
                    
                    setTimeout(typeCode, 200);
                }
            } else {
                
                setTimeout(() => {
                    codeSpace.innerHTML = '';
                    currentLine = 0;
                    currentChar = 0;
                    typeCode();
                }, 3000);
            }
        }

        
        typeCode();