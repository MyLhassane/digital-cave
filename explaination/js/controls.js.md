# js/controls.js — التحكم في الحركة والاختيار

## ما هو هذا الملف؟

هذا الملف يحتوي على نظامين للتفاعل:
1. **الحركة**: التمرير باللمس أو عجلة الفأرة للتحرك داخل الكهف.
2. **الاختيار**: النقر على العناصر التفاعلية (اللوحات الإرشادية).

---

## دوال مساعدة

### `clamp(value, min, max)`
```javascript
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
```
تقيّد القيمة بين حدين أدنى وأقصى. تستخدم لمنع الكاميرا من تجاوز حدود الكهف.

---

## الدوال الأساسية

### 1. `bindMovementControls(state, bounds)`

تربط أحداث اللمس وعجلة الفأرة بحركة الكاميرا:

#### اللمس (Touch)
```javascript
window.addEventListener("touchstart", (e) => {
    state.touchStartY = e.touches[0].clientY;
}, { passive: false });
```
- عند بدء اللمس، تسجل موقع الإصبع الرأسي (Y).

```javascript
window.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const deltaY = state.touchStartY - touchY;
    state.targetZ -= deltaY * 2.0;
    state.targetZ = clamp(state.targetZ, bounds.minZ, bounds.maxZ);
    state.touchStartY = touchY;  // تحديث نقطة البداية
}, { passive: false });
```
- `e.preventDefault()` يمنع التمرير الافتراضي للمتصفح (مهم جدًا لتجربة سلسة).
- `deltaY`: الفرق بين موقع الإصبع الحالي وبداية اللمس.
- مضروب في `2.0` لزيادة حساسية الحركة.
- `clamp`: يمنع الخروج عن حدود الكهف.

#### عجلة الفأرة (Wheel)
```javascript
window.addEventListener("wheel", (e) => {
    state.targetZ -= e.deltaY * 0.75;
    state.targetZ = clamp(state.targetZ, bounds.minZ, bounds.maxZ);
});
```
- `deltaY`: قيمة التمرير (موجب = للأسفل، سالب = للأعلى).
- مضروب في `0.75` لتناسب الحساسية مع اللمس.

### 2. `bindSelectionControls({ state, camera, interactiveTargets, onTargetSelected })`

تربط النقر (بالماوس أو اللمس) بالاكتشاف (Raycasting):

```javascript
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
```

#### كيف يعمل Raycasting؟
1. تحويل إحداثيات النقر من شاشة (pixels) إلى إحداثيات Three.js (Normalized Device Coordinates: -1 إلى 1).
2. إطلاق شعاع (ray) من الكاميرا عبر تلك النقطة.
3. فحص تقاطع الشعاع مع العناصر التفاعلية (`interactiveTargets`).
4. إذا وجد تقاطع، استدعاء `onTargetSelected` مع العنصر المحدد.

#### منع التفاعل أثناء الانتقال
```javascript
if (state.isTransitioning) { return; }
```
يمنع النقر على العناصر الأخرى بينما المستخدم في طور الانتقال إلى صفحة أخرى.

---

## تدفق الاستخدام

```javascript
bindMovementControls(state, movementBounds);
bindSelectionControls({
    state, camera, interactiveTargets,
    onTargetSelected: (target) => {
        // transition logic
    }
});
```

الحركة والاختيار يعملان معًا: المستخدم يتحرك في الكهف باللمس/التمرير، وعندما يرى لوحة تعجبه، ينقر عليها للذهاب إلى وجهتها.
