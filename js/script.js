var sqlInjectionModel;
var myChart

// 文字轉陣列
function santenceToVector(inputSantences) {
    inputSantences = inputSantences.toLowerCase()
    let result = []
    alphabet = " abcdefghijklmnopqrstuvwxyz0123456789-,;.!?:'\"/\\|_@#$%^&*~`+-=<>()[]{}"
    // 轉換句子為數值
    for (i = 0; i < inputSantences.length; i++) {
        singleChar = inputSantences.charAt(i)
        charNumber = alphabet.indexOf(singleChar)
        result.push(charNumber)
    }
    // 將長度填充為1000 
    let diff = 1000 - result.length
    for (i = 0; i < diff; i++) {
        result.push(0)
    }
    return [result]
}

//符號轉陣列
function symbolToVector(inputSantences) {
    let result = []
    symbol = " -,;.!?:'\"/\\|_@#$%^&*~`+-=<>()[]{}"
    // 轉換句子為數值
    for (i = 0; i < inputSantences.length; i++) {
        singleChar = inputSantences.charAt(i)

        if (singleChar > -1) {
            charNumber = alphabet.indexOf(singleChar)
            result.push(charNumber)
        } else {
            charNumber = alphabet.indexOf(singleChar)
            result.push(0)
        }
    }
    // 將長度填充為1000 
    let diff = 1000 - result.length
    for (i = 0; i < diff; i++) {
        result.push(0)
    }
    return [result]
}

// 預測器
function prediction(stringInput, InputType) {

    let predictResult;

    if (InputType == 'TextAndSymbol') {
        let santenceVectorArray = santenceToVector(stringInput);
        let santenceVectorTensor = tf.tensor(santenceVectorArray);
        let symbolVectorArray = symbolToVector(stringInput);
        let symbolVectorTensor = tf.tensor(symbolVectorArray);
        predictResult = sqlInjectionModel.predict([santenceVectorTensor, symbolVectorTensor])
    } else {
        let santenceVectorArray = santenceToVector(stringInput);
        let santenceVectorTensor = tf.tensor(santenceVectorArray);
        predictResult = sqlInjectionModel.predict(santenceVectorTensor)
    }
    return predictResult.dataSync()[0]//將Tensor轉成一般數字輸出
}

//更新圖表
async function updateChart() {
    let textArea = document.getElementById("textarea1")
    let resultElement = document.getElementById("resultElement")
    let text = textArea.value
    let result = await prediction(text, 'Text')
    resultElement.innerHTML = result
    setPieChart(result)
}

//設置文字修改偵聽器
function setChangeListener() {
    console.log("Set change listener")
    let textArea = document.getElementById("textarea1")
    textArea.addEventListener('keyup', updateChart);
    textArea.addEventListener('keydown', updateChart);
    textArea.addEventListener('keypress', updateChart);
}

//設置圓餅圖
function setPieChart(inputNumber) {
    try {
        myChart.destroy()
    } catch (e) {

    }
    inputNumber = inputNumber * 100
    const data = {
        labels: [
            'Positive (SQL injection possibility)',
            'Negative (Normal string possibility)',
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [inputNumber, 100 - inputNumber],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
            ],
            hoverOffset: 4
        }]
    };
    let config = {
        type: 'doughnut',
        data: data,
        responsive: true,
    };
    myChart = new Chart(
        document.getElementById("evalueChart"),
        config
    );
}

// 畫面載入之後
window.onload = async function () {
    // 載入模型
    sqlInjectionModel = await tf.loadLayersModel('./models/model.json');
    setChangeListener()
    updateChart()
}