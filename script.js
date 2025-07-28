// DOM Elements
const arraySizeSlider = document.getElementById('arraySize');
const arraySizeValue = document.getElementById('arraySizeValue');
const sortSpeedSlider = document.getElementById('sortSpeed');
const sortSpeedValue = document.getElementById('sortSpeedValue');
const visualizationMode = document.getElementById('visualizationMode');
const algorithmSelect = document.getElementById('algorithm');
const algorithmSelect2 = document.getElementById('algorithm2');
const comparisonMode = document.getElementById('comparisonMode');
const generateArrayBtn = document.getElementById('generateArrayBtn');
const sortBtn = document.getElementById('sortBtn');
const visualizationArea = document.getElementById('visualizationArea');
const visualizationArea1 = document.getElementById('visualizationArea1');
const visualizationArea2 = document.getElementById('visualizationArea2');
const comparisonVisualization = document.getElementById('comparisonVisualization');
const singleVisualization = document.getElementById('singleVisualization');
const operationsCount = document.getElementById('operationsCount');
const timeElapsed = document.getElementById('timeElapsed');
const operationsCount1 = document.getElementById('operationsCount1');
const timeElapsed1 = document.getElementById('timeElapsed1');
const operationsCount2 = document.getElementById('operationsCount2');
const timeElapsed2 = document.getElementById('timeElapsed2');
const algorithmName = document.querySelector('.algorithm-name');
const codeLanguage = document.getElementById('codeLanguage');
const codeEditor = document.getElementById('codeEditor');
const saveCodeBtn = document.getElementById('saveCodeBtn');
const themeToggle = document.getElementById('themeToggle');

// Global state
let array = [];
let array1 = [];
let array2 = [];
let isSorting = false;
let sortSpeed = 150;
let operations = 0;
let startTime;
let timeoutId;
let currentAlgorithm = 'bubbleSort';
let algorithmDescriptions = {
    bubbleSort: "Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. This process continues until the list is sorted.",
    selectionSort: "Selection Sort divides the input list into a sorted and an unsorted region. It repeatedly selects the smallest (or largest) element from the unsorted region and moves it to the sorted region.",
    insertionSort: "Insertion Sort builds the final sorted array one item at a time. It takes each element from the input and inserts it into its correct position in the sorted array.",
    mergeSort: "Merge Sort is a divide-and-conquer algorithm that divides the input array into two halves, sorts each half recursively, and then merges the sorted halves.",
    quickSort: "Quick Sort is a divide-and-conquer algorithm that selects a 'pivot' element and partitions the array around the pivot, placing smaller elements before it and larger elements after it."
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateRandomArray();
    updateCodeEditor();
    setupEventListeners();
    updateSpeedValue();
});

// Set up event listeners
function setupEventListeners() {
    arraySizeSlider.addEventListener('input', () => {
        arraySizeValue.textContent = arraySizeSlider.value;
        generateRandomArray();
    });
    
    sortSpeedSlider.addEventListener('input', () => {
        updateSpeedValue();
    });
    
    visualizationMode.addEventListener('change', renderArray);
    algorithmSelect.addEventListener('change', () => {
        currentAlgorithm = algorithmSelect.value;
        algorithmName.textContent = getAlgorithmName(currentAlgorithm);
        updateCodeEditor();
    });
    
    comparisonMode.addEventListener('change', () => {
        const isComparisonMode = comparisonMode.value === 'compare';
        algorithmSelect2.disabled = !isComparisonMode;
        comparisonVisualization.classList.toggle('hidden', !isComparisonMode);
        singleVisualization.classList.toggle('hidden', isComparisonMode);
        
        // Render appropriate visualization when switching modes
        if (isComparisonMode) {
            generateComparisonArrays();
        } else {
            renderArray();
        }
    });
    
    algorithmSelect2.addEventListener('change', () => {
        if (comparisonMode.value === 'compare') {
            generateComparisonArrays();
        }
    });
    
    generateArrayBtn.addEventListener('click', () => {
        if (isSorting) {
            clearTimeout(timeoutId);
            isSorting = false;
            sortBtn.textContent = '▶️ Start Sorting';
        }
        generateRandomArray();
    });
    
    sortBtn.addEventListener('click', () => {
        if (isSorting) {
            clearTimeout(timeoutId);
            isSorting = false;
            sortBtn.textContent = '▶️ Start Sorting';
        } else {
            startSorting();
        }
    });
    
    codeLanguage.addEventListener('change', updateCodeEditor);
    saveCodeBtn.addEventListener('click', saveCode);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Tooltip for algorithm descriptions
    algorithmSelect.addEventListener('mouseover', (e) => {
        if (e.target.tagName === 'OPTION') {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = algorithmDescriptions[e.target.value];
            tooltip.style.position = 'absolute';
            tooltip.style.background = '#333';
            tooltip.style.color = '#fff';
            tooltip.style.padding = '8px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.zIndex = '1000';
            tooltip.style.maxWidth = '300px';
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.left = `${rect.left}px`;
            
            e.target.addEventListener('mouseout', () => {
                document.body.removeChild(tooltip);
            }, { once: true });
        }
    });
}

// Generate random array
function generateRandomArray() {
    const size = parseInt(arraySizeSlider.value);
    array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 95) + 5);
    }
    
    if (comparisonMode.value === 'compare') {
        generateComparisonArrays();
    } else {
        renderArray();
    }
    
    resetStats();
}

function generateComparisonArrays() {
    const size = parseInt(arraySizeSlider.value);
    array1 = [...array];
    array2 = [...array];
    renderComparisonArrays();
    resetStats();
}

// Render array in visualization area
function renderArray() {
    visualizationArea.innerHTML = '';
    const mode = visualizationMode.value;
    const maxValue = Math.max(...array);
    
    array.forEach((value, index) => {
        let element;
        if (mode === 'bars') {
            element = document.createElement('div');
            element.className = 'bar';
            // Set height as percentage of maxValue (100% = full height)
            element.style.height = `${(value / maxValue) * 100}%`;
            element.textContent = value;
        } else {
            element = document.createElement('div');
            element.className = 'number';
            element.textContent = value;
        }
        visualizationArea.appendChild(element);
    });
}

function renderComparisonArrays() {
    visualizationArea1.innerHTML = '';
    visualizationArea2.innerHTML = '';
    const mode = visualizationMode.value;
    
    const maxValue1 = Math.max(...array1);
    const maxValue2 = Math.max(...array2);
    
    array1.forEach((value, index) => {
        let element;
        if (mode === 'bars') {
            element = document.createElement('div');
            element.className = 'bar';
            element.style.height = `${(value / maxValue1) * 100}%`;
            element.textContent = value;
        } else {
            element = document.createElement('div');
            element.className = 'number';
            element.textContent = value;
        }
        visualizationArea1.appendChild(element);
    });
    
    array2.forEach((value, index) => {
        let element;
        if (mode === 'bars') {
            element = document.createElement('div');
            element.className = 'bar';
            element.style.height = `${(value / maxValue2) * 100}%`;
            element.textContent = value;
        } else {
            element = document.createElement('div');
            element.className = 'number';
            element.textContent = value;
        }
        visualizationArea2.appendChild(element);
    });
}

// Update sort speed display
function updateSpeedValue() {
    const speedValue = parseInt(sortSpeedSlider.value);
    const speeds = ['Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast'];
    sortSpeedValue.textContent = speeds[speedValue - 1];
    sortSpeed = 300 - (speedValue - 1) * 70;
}

// Reset statistics
function resetStats() {
    operations = 0;
    operationsCount.textContent = '0';
    timeElapsed.textContent = '0';
    
    operationsCount1.textContent = '0';
    timeElapsed1.textContent = '0';
    operationsCount2.textContent = '0';
    timeElapsed2.textContent = '0';
}

// Start sorting
function startSorting() {
    if (isSorting) return;
    
    isSorting = true;
    sortBtn.textContent = '⏹️ Stop Sorting';
    operations = 0;
    startTime = Date.now();
    
    if (comparisonMode.value === 'compare') {
        const algo1 = algorithmSelect.value;
        const algo2 = algorithmSelect2.value;
        
        // Reset arrays to unsorted state
        array1 = [...array];
        array2 = [...array];
        
        // Run both algorithms in parallel
        runAlgorithm(algo1, array1, visualizationArea1, operationsCount1, timeElapsed1);
        runAlgorithm(algo2, array2, visualizationArea2, operationsCount2, timeElapsed2);
    } else {
        runAlgorithm(currentAlgorithm, array, visualizationArea, operationsCount, timeElapsed);
    }
}

// Run a specific algorithm
async function runAlgorithm(algorithm, arr, area, operationsElement, timeElement) {
    const originalArr = [...arr];
    let ops = 0;
    const start = Date.now();
    
    // Update stats every 100ms
    const statsInterval = setInterval(() => {
        if (!isSorting) {
            clearInterval(statsInterval);
            return;
        }
        const elapsed = Date.now() - start;
        timeElement.textContent = elapsed;
        operationsElement.textContent = ops;
    }, 100);
    
    // Execute algorithm
    switch (algorithm) {
        case 'bubbleSort':
            await bubbleSort(arr, area, () => ops++);
            break;
        case 'selectionSort':
            await selectionSort(arr, area, () => ops++);
            break;
        case 'insertionSort':
            await insertionSort(arr, area, () => ops++);
            break;
        case 'mergeSort':
            await mergeSort(arr, area, () => ops++);
            break;
        case 'quickSort':
            await quickSort(arr, 0, arr.length - 1, area, () => ops++);
            break;
    }
    
    // Final update
    clearInterval(statsInterval);
    operationsElement.textContent = ops;
    timeElement.textContent = Date.now() - start;
    
    // Mark all as sorted
    markAllAsSorted(area);
    
    // Check if both algorithms have finished (in comparison mode)
    if (comparisonMode.value === 'compare') {
        const allFinished = !document.querySelector('.visualization .algorithm-name:not(:empty)');
        if (allFinished) {
            isSorting = false;
            sortBtn.textContent = '▶️ Start Sorting';
        }
    } else {
        isSorting = false;
        sortBtn.textContent = '▶️ Start Sorting';
    }
}

// Highlight elements being compared
function highlightElements(i, j, area, className = 'comparing') {
    const elements = area.children;
    if (i < elements.length) elements[i].classList.add(className);
    if (j < elements.length) elements[j].classList.add(className);
}

// Remove highlights
function removeHighlights(area) {
    const elements = area.children;
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove('comparing', 'swapping', 'sorted');
    }
}

// Mark all elements as sorted
function markAllAsSorted(area) {
    const elements = area.children;
    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.add('sorted');
    }
}

// Update visualization
function updateVisualization(arr, area, highlights = []) {
    const mode = visualizationMode.value;
    area.innerHTML = '';
    
    // FIX: Recalculate max value each time for proper bar heights
    const maxValue = Math.max(...arr);
    
    arr.forEach((value, index) => {
        let element;
        if (mode === 'bars') {
            element = document.createElement('div');
            element.className = 'bar';
            element.style.height = `${(value / maxValue) * 100}%`;
            element.textContent = value;
        } else {
            element = document.createElement('div');
            element.className = 'number';
            element.textContent = value;
        }
        
        if (highlights.includes(index)) {
            element.classList.add('comparing');
        }
        
        area.appendChild(element);
    });
}

// Swap animation
async function swapAnimation(arr, i, j, area) {
    const elements = area.children;
    if (i < elements.length) elements[i].classList.add('swapping');
    if (j < elements.length) elements[j].classList.add('swapping');
    
    await new Promise(resolve => setTimeout(resolve, sortSpeed));
    
    // Swap elements in array
    [arr[i], arr[j]] = [arr[j], arr[i]];
    
    // Update visualization
    updateVisualization(arr, area, [i, j]);
    
    await new Promise(resolve => setTimeout(resolve, sortSpeed));
}

// Sorting algorithms
async function bubbleSort(arr, area, incrementOps) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (!isSorting) return;
            
            incrementOps();
            highlightElements(j, j + 1, area);
            
            await new Promise(resolve => setTimeout(resolve, sortSpeed));
            
            if (arr[j] > arr[j + 1]) {
                await swapAnimation(arr, j, j + 1, area);
            }
            
            removeHighlights(area);
        }
        // Mark the last element as sorted
        if (area.children[n - i - 1]) {
            area.children[n - i - 1].classList.add('sorted');
        }
    }
    markAllAsSorted(area);
}

async function selectionSort(arr, area, incrementOps) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        
        // Highlight the current minimum
        highlightElements(minIdx, minIdx, area);
        await new Promise(resolve => setTimeout(resolve, sortSpeed));
        
        for (let j = i + 1; j < n; j++) {
            if (!isSorting) return;
            
            incrementOps();
            highlightElements(j, minIdx, area);
            await new Promise(resolve => setTimeout(resolve, sortSpeed));
            
            if (arr[j] < arr[minIdx]) {
                removeHighlights(area);
                minIdx = j;
                highlightElements(minIdx, minIdx, area);
                await new Promise(resolve => setTimeout(resolve, sortSpeed));
            }
            
            removeHighlights(area);
        }
        
        if (minIdx !== i) {
            await swapAnimation(arr, i, minIdx, area);
        }
        
        // Mark the sorted element
        if (area.children[i]) {
            area.children[i].classList.add('sorted');
        }
    }
    markAllAsSorted(area);
}

async function insertionSort(arr, area, incrementOps) {
    let n = arr.length;
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        
        highlightElements(i, j, area);
        await new Promise(resolve => setTimeout(resolve, sortSpeed));
        
        while (j >= 0 && arr[j] > key) {
            if (!isSorting) return;
            
            incrementOps();
            arr[j + 1] = arr[j];
            j = j - 1;
            
            updateVisualization(arr, area, [j + 1, j + 2]);
            await new Promise(resolve => setTimeout(resolve, sortSpeed));
        }
        
        arr[j + 1] = key;
        updateVisualization(arr, area);
        
        // Mark sorted elements
        for (let k = 0; k <= i; k++) {
            if (area.children[k]) {
                area.children[k].classList.add('sorted');
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, sortSpeed));
    }
    markAllAsSorted(area);
}

async function mergeSort(arr, area, incrementOps) {
    await mergeSortRecursive(arr, 0, arr.length - 1, area, incrementOps);
    markAllAsSorted(area);
}

async function mergeSortRecursive(arr, l, r, area, incrementOps) {
    if (l >= r || !isSorting) return;
    
    const m = Math.floor((l + r) / 2);
    await mergeSortRecursive(arr, l, m, area, incrementOps);
    await mergeSortRecursive(arr, m + 1, r, area, incrementOps);
    await merge(arr, l, m, r, area, incrementOps);
}

async function merge(arr, l, m, r, area, incrementOps) {
    let n1 = m - l + 1;
    let n2 = r - m;
    
    let L = new Array(n1);
    let R = new Array(n2);
    
    for (let i = 0; i < n1; i++) {
        L[i] = arr[l + i];
    }
    for (let j = 0; j < n2; j++) {
        R[j] = arr[m + 1 + j];
    }
    
    let i = 0, j = 0, k = l;
    
    while (i < n1 && j < n2) {
        if (!isSorting) return;
        
        incrementOps();
        highlightElements(l + i, m + 1 + j, area);
        await new Promise(resolve => setTimeout(resolve, sortSpeed));
        
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        
        updateVisualization(arr, area);
        await new Promise(resolve => setTimeout(resolve, sortSpeed));
        k++;
    }
    
    while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
        updateVisualization(arr, area);
        await new Promise(resolve => setTimeout(resolve, sortSpeed));
    }
    
    while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
        updateVisualization(arr, area);
        await new Promise(resolve => setTimeout(resolve, sortSpeed));
    }
}

async function quickSort(arr, low, high, area, incrementOps) {
    if (low < high && isSorting) {
        let pi = await partition(arr, low, high, area, incrementOps);
        
        // Mark pivot as sorted
        if (area.children[pi]) {
            area.children[pi].classList.add('sorted');
        }
        
        await quickSort(arr, low, pi - 1, area, incrementOps);
        await quickSort(arr, pi + 1, high, area, incrementOps);
    }
    
    if (low === 0 && high === arr.length - 1) {
        markAllAsSorted(area);
    }
}

async function partition(arr, low, high, area, incrementOps) {
    let pivot = arr[high];
    let i = low - 1;
    
    // Highlight pivot
    highlightElements(high, high, area);
    await new Promise(resolve => setTimeout(resolve, sortSpeed));
    
    for (let j = low; j < high; j++) {
        if (!isSorting) return i + 1;
        
        incrementOps();
        highlightElements(j, high, area);
        await new Promise(resolve => setTimeout(resolve, sortSpeed));
        
        if (arr[j] < pivot) {
            i++;
            await swapAnimation(arr, i, j, area);
        }
    }
    
    await swapAnimation(arr, i + 1, high, area);
    return i + 1;
}

// Get algorithm display name
function getAlgorithmName(algo) {
    const names = {
        bubbleSort: "Bubble Sort",
        selectionSort: "Selection Sort",
        insertionSort: "Insertion Sort",
        mergeSort: "Merge Sort",
        quickSort: "Quick Sort"
    };
    return names[algo] || algo;
}

// Update code editor with sample code
function updateCodeEditor() {
    const language = codeLanguage.value;
    const algo = algorithmSelect.value;
    
    let code = '';
    
    if (language === 'javascript') {
        code = getJavaScriptCode(algo);
    } else if (language === 'python') {
        code = getPythonCode(algo);
    } else if (language === 'cpp') {
        code = getCppCode(algo);
    }
    
    codeEditor.value = code;
}

// Sample code for algorithms
function getJavaScriptCode(algo) {
    switch (algo) {
        case 'bubbleSort':
            return `function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n-1; i++) {
        for (let j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                // Swap elements
                [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
            }
        }
    }
    return arr;
}`;
            
        case 'selectionSort':
            return `function selectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n-1; i++) {
        let minIdx = i;
        for (let j = i+1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        // Swap elements
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}`;
            
        case 'insertionSort':
            return `function insertionSort(arr) {
    let n = arr.length;
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i-1;
        while (j >= 0 && arr[j] > key) {
            arr[j+1] = arr[j];
            j--;
        }
        arr[j+1] = key;
    }
    return arr;
}`;
            
        case 'mergeSort':
            return `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}`;
            
        case 'quickSort':
            return `function quickSort(arr, low = 0, high = arr.length-1) {
    if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi-1);
        quickSort(arr, pi+1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    
    [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
    return i+1;
}`;
            
        default:
            return '// Select an algorithm';
    }
}

function getPythonCode(algo) {
    switch(algo) {
        case 'bubbleSort':
            return `def bubble_sort(arr):
    n = len(arr)
    for i in range(n-1):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr`;
            
        case 'selectionSort':
            return `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i+1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`;
            
        case 'insertionSort':
            return `def insertion_sort(arr):
    n = len(arr)
    for i in range(1, n):
        key = arr[i]
        j = i-1
        while j >= 0 and key < arr[j]:
            arr[j+1] = arr[j]
            j -= 1
        arr[j+1] = key
    return arr`;
            
        case 'mergeSort':
            return `def merge_sort(arr):
    if len(arr) > 1:
        mid = len(arr) // 2
        L = arr[:mid]
        R = arr[mid:]
        merge_sort(L)
        merge_sort(R)
        
        i = j = k = 0
        
        while i < len(L) and j < len(R):
            if L[i] < R[j]:
                arr[k] = L[i]
                i += 1
            else:
                arr[k] = R[j]
                j += 1
            k += 1
            
        while i < len(L):
            arr[k] = L[i]
            i += 1
            k += 1
            
        while j < len(R):
            arr[k] = R[j]
            j += 1
            k += 1
    return arr`;
            
        case 'quickSort':
            return `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi-1)
        quick_sort(arr, pi+1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i+1`;
            
        default:
            return '# Select an algorithm';
    }
}

function getCppCode(algo) {
    switch(algo) {
        case 'bubbleSort':
            return `#include <iostream>
using namespace std;

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
            }
        }
    }
}`;
            
        case 'selectionSort':
            return `#include <iostream>
using namespace std;

void selectionSort(int arr[], int n) {
    for (int i = 0; i < n-1; i++) {
        int min_idx = i;
        for (int j = i+1; j < n; j++) {
            if (arr[j] < arr[min_idx]) {
                min_idx = j;
            }
        }
        swap(arr[min_idx], arr[i]);
    }
}`;
            
        case 'insertionSort':
            return `#include <iostream>
using namespace std;

void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j+1] = arr[j];
            j--;
        }
        arr[j+1] = key;
    }
}`;
            
        case 'mergeSort':
            return `#include <iostream>
using namespace std;

void merge(int arr[], int l, int m, int r) {
    int n1 = m - l + 1;
    int n2 = r - m;
    int L[n1], R[n2];
    
    for (int i = 0; i < n1; i++)
        L[i] = arr[l + i];
    for (int j = 0; j < n2; j++)
        R[j] = arr[m + 1 + j];
        
    int i = 0, j = 0, k = l;
    
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }
    
    while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
    }
    
    while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
    }
}

void mergeSort(int arr[], int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m+1, r);
    merge(arr, l, m, r);
}`;
            
        case 'quickSort':
            return `#include <iostream>
using namespace std;

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i+1], arr[high]);
    return i+1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi-1);
        quickSort(arr, pi+1, high);
    }
}`;
            
        default:
            return '// Select an algorithm';
    }
}

// Save code to file
function saveCode() {
    const language = codeLanguage.value;
    const algo = algorithmSelect.value;
    const filename = `${algo}_${language}.txt`;
    const code = codeEditor.value;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Toggle dark mode
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}