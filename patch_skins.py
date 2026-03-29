import re

with open('styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

new_skins = """/* Temas de skin (aplicados no body via data-skin) */
/* 1. NEON - Cyberpunk Vibes */
body[data-skin="neon"] {
    background: radial-gradient(circle at 10% 20%, rgba(0, 255, 255, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(255, 0, 255, 0.15) 0%, transparent 40%),
                #050508;
}
body[data-skin="neon"] #blocks-container .block {
    border-color: #0ff !important;
    background: rgba(0, 255, 255, 0.1) !important;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.2);
}

/* 2. MIDNIGHT - Dark Sapphire */
body[data-skin="midnight"] {
    background: linear-gradient(135deg, #020b14, #0a1128, #001f3f);
}
body[data-skin="midnight"] #blocks-container .block {
    border-color: #4da8da !important;
    background: rgba(18, 52, 86, 0.8) !important;
    box-shadow: 0 0 12px rgba(77, 168, 218, 0.3), inset 0 0 8px rgba(77, 168, 218, 0.2);
}

/* 3. SUNSET - Retrowave 80s */
body[data-skin="sunset"] {
    background: linear-gradient(180deg, #10002b 0%, #3c096c 40%, #c77dff 80%, #ff9e00 100%);
}
body[data-skin="sunset"] #blocks-container .block {
    border-color: #ff9e00 !important;
    background: linear-gradient(135deg, rgba(255, 158, 0, 0.6), rgba(224, 170, 255, 0.2)) !important;
    box-shadow: 0 0 16px rgba(255, 158, 0, 0.5), inset 0 0 10px rgba(255, 158, 0, 0.3);
}

/* 4. MATRIX - True Terminal Green */
body[data-skin="matrix"] {
    background: radial-gradient(circle at center, rgba(0, 40, 0, 0.6) 0%, #000000 100%);
    position: relative;
}
body[data-skin="matrix"] #blocks-container .block {
    border-color: #00ff41 !important;
    background: rgba(0, 255, 65, 0.1) !important;
    box-shadow: 0 0 15px rgba(0, 255, 65, 0.4), inset 0 0 10px rgba(0, 255, 65, 0.2);
    text-shadow: 0 0 5px #00ff41;
}
body[data-skin="matrix"]::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image:
        linear-gradient(180deg, rgba(0,255,65,0.1) 0 35%, transparent 65% 100%),
        repeating-linear-gradient(180deg, rgba(0,255,65,0.05) 0 4px, transparent 4px 8px);
    background-size: 100% 160px;
    animation: matrixRain 2s linear infinite;
    opacity: 0.8;
}

/* 5. LAVA - Volcanic Ash / Magma */
body[data-skin="lava"] {
    background: radial-gradient(circle at bottom, rgba(140, 15, 0, 0.5) 0%, #0d0d0d 80%);
}
body[data-skin="lava"] #blocks-container .block {
    border-color: #ff4500 !important;
    background: linear-gradient(135deg, rgba(255, 69, 0, 0.7), rgba(139, 0, 0, 0.3)) !important;
    box-shadow: 0 0 18px rgba(255, 69, 0, 0.5), inset 0 0 15px rgba(255, 69, 0, 0.4);
}

/* 6. ICE - Frosted Glass */
body[data-skin="ice"] {
    background: linear-gradient(135deg, #0b1d3a, #1a365d, #2c5282);
}
body[data-skin="ice"]::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image:
        radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.1) 0 5%, transparent 15%),
        radial-gradient(circle at 80% 80%, rgba(200, 230, 255, 0.15) 0 8%, transparent 20%);
    backdrop-filter: blur(2px) saturate(120%);
}
body[data-skin="ice"] #blocks-container .block {
    border-color: #e2f1ff !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05)) !important;
    box-shadow: 0 0 15px rgba(180, 220, 255, 0.4), inset 0 0 12px rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(5px);
}

/* 7. AURORA - Borealis Lights */
body[data-skin="aurora"] {
    background: linear-gradient(135deg, #00100d 0%, #032b26 40%, #051937 80%, #17002e 100%);
}
body[data-skin="aurora"] #blocks-container .block {
    border-color: #00ffcc !important;
    background: rgba(0, 255, 204, 0.1) !important;
    box-shadow: 0 0 16px rgba(0, 255, 204, 0.5), inset 0 0 10px rgba(0, 255, 204, 0.3);
}

/* 8. CYBERPINK - Tokyo Night */
body[data-skin="cyberpink"] {
    background: radial-gradient(ellipse at top right, rgba(219, 39, 119, 0.25) 0%, transparent 50%),
                radial-gradient(ellipse at bottom left, rgba(107, 33, 168, 0.3) 0%, transparent 50%),
                #0d0415;
}
body[data-skin="cyberpink"] #blocks-container .block {
    border-color: #ff2a85 !important;
    background: rgba(255, 42, 133, 0.15) !important;
    box-shadow: 0 0 18px rgba(255, 42, 133, 0.5), inset 0 0 12px rgba(255, 42, 133, 0.25);
}

/* 9. GALAXY - Deep Cosmos Nebula */
body[data-skin="galaxy"] {
    background: radial-gradient(circle at 30% 20%, rgba(75, 0, 130, 0.3), transparent 40%),
                radial-gradient(circle at 70% 80%, rgba(25, 25, 112, 0.4), transparent 40%),
                #04000a;
}
body[data-skin="galaxy"]::after {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image: 
        radial-gradient(circle at center, white 1px, transparent 1px),
        radial-gradient(circle at center, rgba(255,255,255,0.8) 1px, transparent 1px);
    background-size: 100px 100px, 60px 60px;
    background-position: 0 0, 30px 30px;
    opacity: 0.15;
}
body[data-skin="galaxy"] #blocks-container .block {
    border-color: #b388ff !important;
    background: rgba(138, 43, 226, 0.3) !important;
    box-shadow: 0 0 18px rgba(138, 43, 226, 0.6), inset 0 0 12px rgba(138, 43, 226, 0.3);
}

/* 10. GOLDPULSE - Liquid Luxury */
body[data-skin="goldpulse"] {
    background: radial-gradient(circle at 50% 0%, rgba(184, 134, 11, 0.3) 0%, #0d0d0d 60%);
}
body[data-skin="goldpulse"] #blocks-container .block {
    border-color: #ffdf00 !important;
    background: linear-gradient(135deg, rgba(255, 223, 0, 0.4), rgba(218, 165, 32, 0.1)) !important;
    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5), inset 0 0 10px rgba(218, 165, 32, 0.3);
}

"""

pattern = r'/\*\s*Temas de skin \(aplicados no body via data-skin\)\s*\*/.*?(?=@keyframes matrixRain)'
replaced_content = re.sub(pattern, new_skins, content, flags=re.DOTALL)

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(replaced_content)

print(f"Replaced {len(content) - len(replaced_content)} bytes. Ready.")
