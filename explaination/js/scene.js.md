# js/scene.js — إنشاء المشهد والإضاءة والكاميرا

## ما هو هذا الملف؟

هذا الملف هو المسؤول عن **تهيئة البيئة الأساسية لـ Three.js**: المشهد، الكاميرا، المُعرّض (Renderer)، والإضاءة. كل ما تحتاجه لبدء الرسم ثلاثي الأبعاد.

---

## الدوال

### 1. `createSceneContext()`

تنشئ وتُعيد كل العناصر الأساسية:

#### أ. المشهد (Scene)
```javascript
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x01040a, 0.00085);
```
- يضيف ضبابًا أسيًا (Exponential Fog) بلون الخلفية الداكن.
- الضباب يخفي الأجزاء البعيدة من الكهف ويعطي إحساسًا بالعمق.
- قيمة `0.00085` تتحكم في كثافة الضباب (كلما زادت، أصبح الضباب أثقل).

#### ب. الكاميرا (Camera)
```javascript
const camera = new THREE.PerspectiveCamera(45, width/height, 1, 10000);
camera.position.set(0, 0, 150);
```
- **كاميرا منظور (Perspective)**: زاوية رؤية 45 درجة.
- **نسبة العرض إلى الارتفاع**: تُحسب ديناميكيًا من حجم النافذة.
- **مدى الرؤية**: من 1 إلى 10000 وحدة.
- **الموقع الابتدائي**: في المنتصف (`0, 0`) على بعد 150 وحدة من المدخل.

#### ج. المُعرّض (Renderer)
```javascript
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```
- يستخدم WebGL مع **مكافحة التعرج (antialias)** للحواف الناعمة.
- **حد أقصى لنسبة البكسل**: 2 للحفاظ على الأداء على الشاشات عالية الدقة.

#### د. الإضاءة (Lighting)
- **AmbientLight**: إضاءة محيطة بيضاء بقوة 0.5 (لرؤية الأشكال في الظلام).
- **PointLight (headlight)**: كشاف أمامي أبيض بقوة 2.0 يتحرك مع الكاميرا (مدى 1500 وحدة).

**الإرجاع**: كائن واحد يجمع كل هذه العناصر:
```javascript
return { scene, camera, renderer, headlight };
```

### 2. `bindResizeHandler(camera, renderer)`

تربط حدث `resize` على النافذة:
- تعيد حساب `aspect` ratio للكاميرا.
- تحدث مصفوفة الإسقاط (`updateProjectionMatrix`).
- تغير حجم المُعرّض لملء النافذة الجديدة.

هذا يضمن أن التجربة تبدو صحيحة دائمًا بغض النظر عن حجم الشاشة.

---

## لماذا هذا الملف مهم؟

لأنه **يفصل مسؤولية التهيئة** عن بقية المنطق. أي صفحة جديدة تريد استخدام Three.js只需 تستدعي `createSceneContext()` وتحصل على كل شيء جاهز.
