# styles/main.css — الأنماط والتنسيقات العامة

## ما هو هذا الملف؟

ملف CSS مسؤول عن التنسيقات البصرية المشتركة بين جميع صفحات المشروع.

---

## شرح كل سطر

### 1. المتغيرات العامة (Custom Properties)

```css
:root { --bg-dark: #01040a; --panel-glow: #00D4FF; }
```

- `--bg-dark`: لون الخلفية الداكن جدًا (أزرق - أسود) المستخدم في كل الصفحات.
- `--panel-glow`: لون التوهج السماوي (سيان) المستخدم في اللوحات.

### 2. إعادة التعيين (Reset)

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
```

يزيل الهوامش والحواشي الافتراضية من كل العناصر، ويجعل الـ padding محسوبًا ضمن أبعاد العنصر.

### 3. تنسيق الصفحة

```css
body, html {
    width: 100%; height: 100%;
    overflow: hidden;           /* منع أشرطة التمرير */
    background-color: var(--bg-dark);
    font-family: sans-serif;
    color: #fff;
    direction: rtl;             /* دعم اللغة العربية */
    touch-action: none;         /* منع التمرير الافتراضي في اللمس */
}
```

### 4. لوحة الرسم (Canvas)

```css
canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
    position: absolute;
    top: 0; left: 0;
    touch-action: none;
    z-index: 1;
}
```

يجعل لوحة Three.js تملأ الشاشة بالكامل وتكون فوق كل العناصر عدا التراكبات (overlays).

### 5. تراكب التلاشي (Fade Overlay)

```css
#fade-overlay {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: #01040a;
    z-index: 9990;
    pointer-events: none;       /* لا يعيق النقر */
    opacity: 0;                 /* مخفي افتراضيًا */
    transition: opacity 0.6s ease-in-out;  /* تلاشي سلس */
}
```

### 6. شاشة التوجيه (Orientation Screen)

```css
#orientation-screen {
    display: none;
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: #0a0a0c;
    z-index: 9999;
    text-align: center;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

@media screen and (orientation: portrait) {
    #orientation-screen { display: flex; }
}
```

تظهر فقط عندما يكون الجهاز في **الوضع العمودي** (portrait)، وتطلب من المستخدم تدوير الجهاز أفقيًا. مخفية (`display: none`) في الوضع الأفقي.
