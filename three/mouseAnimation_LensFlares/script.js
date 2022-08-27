// シーンなどが使えるようにモジュールをすべてインポート
import * as THREE from "./build/three.module.js";
// 左上のFPSが表示されているバー
import Stats from "./jsm/libs/stats.module.js";
// マウス操作
import { FlyControls } from "./jsm/controls/FlyControls.js";
// レンズフレア
import { Lensflare, LensflareElement } from "./jsm/objects/Lensflare.js";

let container, stats;

let camera, scene, renderer;
let controls;

// 現在の経過時間を出力する
const clock = new THREE.Clock();

init();
animate();

// 初期化関数
function init() {

    container = document.createElement("div");
    document.body.appendChild(container);

    // カメラ
    camera = new THREE.PerspectiveCamera(
        40, // 視野角
        window.innerWidth / window.innerHeight, // アスペクト比
        1, // 開始距離
        15000 // 終了距離
    );
    camera.position.z = 250; // カメラを引きでみる

    // シーン
    scene = new THREE.Scene();

    const size = 250;
    const geometry = new THREE.BoxGeometry(size, size, size); // 箱の大きさ設定
    const material = new THREE.MeshPhongMaterial({ // 箱の色など設定
        color: 0xffffff, // 色:白
        specular: 0xffffff, // 鏡面反射
        shininess: 50, // 輝度
    });
    
    // 箱を2500個作成
    for(let i = 0; i < 2500; i++) {
        // geometry と material をまとめるmeshを作成
        const mesh = new THREE.Mesh(geometry, material);

        //位置をランダムに決める
        mesh.position.x = 8000 * (2.0 * Math.random() - 1.0);
        mesh.position.y = 8000 * (2.0 * Math.random() - 1.0);
        mesh.position.z = 8000 * (2.0 * Math.random() - 1.0);

        // 回転度合いをランダムに決める
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;

        scene.add(mesh);           
    }

    // 平行光源
    const dirLight = new THREE.DirectionalLight(0x88f8ff, 0.03); // 色, 光の強さ
    // dirLight.color.setHSL(0.1, 0.7, 0.5); // HSLで色指定したい場合
    scene.add(dirLight);

    // レンズフレアを追加
    const textureLoader = new THREE.TextureLoader();
    const textureFlare = textureLoader.load("./textures/LensFlare.jpg");
    
    // ポイント光源
    addLight(0.08, 0.3, 0.9, 0, 0, -1000)
    function addLight(h, s, l, x, y, z) { // 色相:hue, 彩度:saturation, 輝度:light
        const light = new THREE.PointLight(0xffffff, 1.5, 2000); //色、強さ、減衰
        light.color.setHSL(h, s, l); // 光の色
        light.position.set(x, y, z); // 光の位置
        scene.add(light);

        // レンズフレア設定
        const lensflare = new Lensflare(); // Lensflare関数をインスタンス化
        lensflare.addElement(
            new LensflareElement(textureFlare, 700, 0, light.color)
        );

        scene.add(lensflare);
    }

    // レンダラー
    renderer = new THREE.WebGLRenderer(); //　今回はWebGLRenderer を使用
    renderer.setSize(window.innerWidth, window.innerHeight); // 画面いっぱいいっぱいに表現
    renderer.outputEncoding = THREE.sRGBEncoding; // レンズフレアを明るく描画
    container.appendChild(renderer.domElement); // container(body > div)にレンダラーを入れる
    // document.body.appendChild(renderer.domElement); // bodyにレンダラーを入れる
    

    // マウス操作
    controls = new FlyControls(camera, renderer.domElement);

    controls.movementSpeed = 2500; // 左クリック、右クリック時の速度
    controls.rollSpeed = Math.PI / 20; // マウス操作時の速度

    // stats 左上のバー
    stats = new Stats();
    container.appendChild(stats.dom);
    
    // リサイズしたら自動でウインドウをリサイズする
    window.addEventListener("resize", onWindowResize);

}

// リサイズしたときに画面いっぱいいっぱいにする
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
// マウス操作のアニメーション
function animate() {
    requestAnimationFrame(animate); //自分(animate関数)を毎フレーム呼び出す

    const delta = clock.getDelta(); //経過した時間を取得
    controls.update(delta); // deltaをアップデートすることによってマウス操作ができるようになる

    renderer.render(scene, camera); // シーンとカメラをレンダリング

    // stats 左上のバー
    stats.update();
}