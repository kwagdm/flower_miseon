// 1. Data Definitions
// Note: Using new sticker for Red Rose, others remain as 'die-cut like' photos
const flowers = [
    { id: 'rose-red', name: 'Red Rose', type: 'rose', image: 'assets/red_rose_sticker.png' },
    { id: 'rose-white', name: 'White Rose', type: 'rose', image: 'assets/white_rose.png' },
    { id: 'lily-white', name: 'White Lily', type: 'lily', image: 'assets/white_lily.png' },
    { id: 'lily-pink', name: 'Pink Lily', type: 'lily', image: 'assets/pink_lily.png' }
];

const placedItemsStack = [];
let selectedItem = null;

console.log('Flower Arrangement App Initialized (Sticker + Rotation Mode)');

function renderFlowerList() {
    const listContainer = document.getElementById('flower-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    flowers.forEach(flower => {
        const flowerEl = document.createElement('div');
        flowerEl.className = 'flower-item';
        flowerEl.draggable = true;
        flowerEl.dataset.id = flower.id;

        const img = document.createElement('img');
        img.className = 'flower-icon-img';
        img.src = flower.image;
        img.alt = flower.name;

        const name = document.createElement('span');
        name.className = 'flower-name';
        name.textContent = flower.name;

        flowerEl.appendChild(img);
        flowerEl.appendChild(name);

        listContainer.appendChild(flowerEl);
    });
}

function initDragAndDrop() {
    const draggables = document.querySelectorAll('.flower-item');
    const canvas = document.querySelector('.canvas-area');

    if (!canvas) return;

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', draggable.dataset.id);
            e.dataTransfer.effectAllowed = 'copy';
            // Deselect when starting new drag
            deselectAll();
        });

        draggable.addEventListener('click', () => {
            const flower = flowers.find(f => f.id === draggable.dataset.id);
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2 - 50;

            if (flower) {
                const rX = centerX + (Math.random() * 40 - 20);
                const rY = centerY + (Math.random() * 40 - 20);
                addFlowerToCanvas(flower, rX, rY, canvas);
            }
        });
    });

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const flowerId = e.dataTransfer.getData('text/plain');
        const flower = flowers.find(f => f.id === flowerId);

        if (flower) {
            const rect = canvas.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;

            addFlowerToCanvas(flower, relX, relY, canvas);
        }
    });

    // Deselect on canvas click (background)
    canvas.addEventListener('mousedown', (e) => {
        if (e.target === canvas || e.target.classList.contains('flower-pot')) {
            deselectAll();
        }
    });
}

function addFlowerToCanvas(flower, x, y, canvas) {
    const placedFlower = document.createElement('img');
    placedFlower.className = 'placed-flower-img';
    placedFlower.src = flower.image;
    placedFlower.draggable = false;

    placedFlower.style.left = `${x}px`;
    placedFlower.style.top = `${y}px`;

    // Store rotation in dataset for easier logic
    let initialRotation = Math.random() * 20 - 10;
    placedFlower.dataset.rotation = initialRotation;
    placedFlower.style.transform = `translate(-50%, -50%) rotate(${initialRotation}deg) scale(0.6)`;

    enableItemInteraction(placedFlower, canvas);

    canvas.appendChild(placedFlower);
    placedItemsStack.push(placedFlower);

    // Auto-select newly added item
    selectItem(placedFlower);
}

function enableItemInteraction(element, container) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    element.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        e.preventDefault();

        // Select this item
        selectItem(element);

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        initialLeft = parseFloat(element.style.left || 0);
        initialTop = parseFloat(element.style.top || 0);

        element.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newX = initialLeft + dx;
        let newY = initialTop + dy;

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';
        }
    });
}

// Selection & Rotation Logic
function selectItem(element) {
    deselectAll();
    selectedItem = element;
    selectedItem.classList.add('selected');

    const slider = document.getElementById('rotation-slider');
    if (slider) {
        slider.disabled = false;
        // Read current rotation from dataset or style? Dataset is safer/cleaner source of truth
        let currentRot = parseFloat(selectedItem.dataset.rotation || 0);
        slider.value = currentRot;
    }
}

function deselectAll() {
    if (selectedItem) {
        selectedItem.classList.remove('selected');
        selectedItem = null;
    }
    const slider = document.getElementById('rotation-slider');
    if (slider) {
        slider.disabled = true;
        slider.value = 0;
    }
}

function initRotationControl() {
    const slider = document.getElementById('rotation-slider');
    if (!slider) return;

    slider.addEventListener('input', (e) => {
        if (!selectedItem) return;

        const deg = e.target.value;
        selectedItem.dataset.rotation = deg;
        // Keep scale consistent
        selectedItem.style.transform = `translate(-50%, -50%) rotate(${deg}deg) scale(0.6)`;
    });
}

function initUndo() {
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            const lastItem = placedItemsStack.pop();
            if (lastItem) {
                if (lastItem === selectedItem) deselectAll();
                lastItem.remove();
            }
        });
    }
}

function init() {
    console.log('DOM Content Loaded (Sticker Mode)');
    renderFlowerList();
    initDragAndDrop();
    initUndo();
    initRotationControl();

    // Auto-place one flower
    const canvas = document.querySelector('.canvas-area');
    const defaultFlower = flowers[0];
    if (canvas && defaultFlower) {
        setTimeout(() => {
            const rect = canvas.getBoundingClientRect();
            addFlowerToCanvas(defaultFlower, rect.width / 2, rect.height / 2 - 100, canvas);
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', init);
