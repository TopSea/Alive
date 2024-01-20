// for use loading screen, we need to import following module.
import "@babylonjs/core/Loading/loadingScreen";
// for cast shadow, we need to import following module.
import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
// for use WebXR we need to import following two modules.
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/core/Materials/Node/Blocks";
// if your model has .tga texture, uncomment following line.
// import "@babylonjs/core/Materials/Textures/Loaders/tgaTextureLoader";
// for load .bpmx file, we need to import following module.
import "babylon-mmd/esm/Loader/Optimized/bpmxLoader";
// if you want to use .pmx file, uncomment following line.
// import "babylon-mmd/esm/Loader/pmxLoader";
// if you want to use .pmd file, uncomment following line.
// import "babylon-mmd/esm/Loader/pmdLoader";
// for play `MmdAnimation` we need to import following two modules.
import "babylon-mmd/esm/Runtime/Animation/mmdRuntimeCameraAnimation";
import "babylon-mmd/esm/Runtime/Animation/mmdRuntimeModelAnimation";

import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { Scene } from "@babylonjs/core/scene";
import havokPhysics from "@babylonjs/havok";
import { ShadowOnlyMaterial } from "@babylonjs/materials/shadowOnly/shadowOnlyMaterial";
import type { MmdAnimation } from "babylon-mmd/esm/Loader/Animation/mmdAnimation";
import type { MmdStandardMaterialBuilder } from "babylon-mmd/esm/Loader/mmdStandardMaterialBuilder";
import type { BpmxLoader } from "babylon-mmd/esm/Loader/Optimized/bpmxLoader";
import { BvmdLoader } from "babylon-mmd/esm/Loader/Optimized/bvmdLoader";
import { SdefInjector } from "babylon-mmd/esm/Loader/sdefInjector";
import { StreamAudioPlayer } from "babylon-mmd/esm/Runtime/Audio/streamAudioPlayer";
import { MmdCamera } from "babylon-mmd/esm/Runtime/mmdCamera";
import type { MmdMesh } from "babylon-mmd/esm/Runtime/mmdMesh";
import { MmdPhysics } from "babylon-mmd/esm/Runtime/mmdPhysics";
import { MmdRuntime } from "babylon-mmd/esm/Runtime/mmdRuntime";
import { MmdPlayerControl } from "babylon-mmd/esm/Runtime/Util/mmdPlayerControl";

import type { ISceneBuilder } from "./MMDRuntime";

export class SceneBuilder implements ISceneBuilder {
    public async build(canvas: HTMLCanvasElement, engine: Engine): Promise<Scene> {
        // for apply SDEF on shadow, outline, depth rendering
        SdefInjector.OverrideEngineCreateEffect(engine);

        // get bpmx loader and set some configurations.
        const bpmxLoader = SceneLoader.GetPluginForExtension(".bpmx") as BpmxLoader;
        bpmxLoader.loggingEnabled = true;
        const materialBuilder = bpmxLoader.materialBuilder as MmdStandardMaterialBuilder;

        // if you want override texture loading, uncomment following lines.
        // materialBuilder.loadDiffuseTexture = (): void => { /* do nothing */ };
        // materialBuilder.loadSphereTexture = (): void => { /* do nothing */ };
        // materialBuilder.loadToonTexture = (): void => { /* do nothing */ };

        // if you need outline rendering, comment out following line.
        materialBuilder.loadOutlineRenderingProperties = (): void => { /* do nothing */ };

        const scene = new Scene(engine);
        scene.clearColor = new Color4(0.95, 0.95, 0.95, 1.0);

        // scaling for WebXR
        const worldScale = 0.09;

        const mmdRoot = new TransformNode("mmdRoot", scene);
        mmdRoot.scaling.scaleInPlace(worldScale);
        mmdRoot.position.z = 1;

        // mmd camera for play mmd camera animation
        const mmdCamera = new MmdCamera("mmdCamera", new Vector3(0, 10, 0), scene);
        mmdCamera.maxZ = 300;
        mmdCamera.minZ = 1;
        mmdCamera.parent = mmdRoot;

        const camera = new ArcRotateCamera("arcRotateCamera", 0, 0, 45 * worldScale, new Vector3(0, 10 * worldScale, 1), scene);
        camera.maxZ = 1000;
        camera.minZ = 0.1;
        camera.setPosition(new Vector3(0, 10, -45).scaleInPlace(worldScale));
        camera.attachControl(canvas, false);
        camera.inertia = 0.8;
        camera.speed = 4 * worldScale;

        const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(0, 1, 0), scene);
        hemisphericLight.intensity = 0.4;
        hemisphericLight.specular = new Color3(0, 0, 0);
        hemisphericLight.groundColor = new Color3(1, 1, 1);

        const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(0.5, -1, 1), scene);
        directionalLight.intensity = 0.6;
        // set frustum size manually for optimize shadow rendering
        directionalLight.autoCalcShadowZBounds = false;
        directionalLight.autoUpdateExtends = false;
        directionalLight.shadowMaxZ = 20 * worldScale;
        directionalLight.shadowMinZ = -20 * worldScale;
        directionalLight.orthoTop = 18 * worldScale;
        directionalLight.orthoBottom = -3 * worldScale;
        directionalLight.orthoLeft = -10 * worldScale;
        directionalLight.orthoRight = 10 * worldScale;
        directionalLight.shadowOrthoScale = 0;

        const shadowGenerator = new ShadowGenerator(1024, directionalLight, true);
        shadowGenerator.usePercentageCloserFiltering = true;
        shadowGenerator.forceBackFacesOnly = true;
        shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
        shadowGenerator.frustumEdgeFalloff = 0.1;

        const ground = CreateGround("ground1", { width: 100, height: 100, subdivisions: 2, updatable: false }, scene);
        const shadowOnlyMaterial = ground.material = new ShadowOnlyMaterial("shadowOnly", scene);
        shadowOnlyMaterial.activeLight = directionalLight;
        shadowOnlyMaterial.alpha = 0.4;
        ground.receiveShadows = true;
        ground.parent = mmdRoot;

        // create mmd runtime with physics
        const mmdRuntime = new MmdRuntime(scene, new MmdPhysics(scene));
        mmdRuntime.loggingEnabled = true;
        mmdRuntime.register(scene);

        // set audio player
        const audioPlayer = new StreamAudioPlayer(scene);
        audioPlayer.preservesPitch = false;
        // you need to get this file by yourself from https://youtu.be/y__uZETTuL8
        audioPlayer.source = "https://asset.localhost/mmd/我也不知道叫啥/bgm.mp3";
        mmdRuntime.setAudioPlayer(audioPlayer);

        // play before loading. this will cause the audio to play first before all assets are loaded.
        // playing the audio first can help ease the user's patience
        mmdRuntime.playAnimation();

        // create youtube like player control
        const mmdPlayerControl = new MmdPlayerControl(scene, mmdRuntime, audioPlayer);
        mmdPlayerControl.showPlayerControl();

        // show loading screen
        engine.displayLoadingUI();

        const loadingTexts: string[] = [];
        const updateLoadingText = (updateIndex: number, text: string): void => {
            loadingTexts[updateIndex] = text;
            engine.loadingUIText = "<br/><br/><br/><br/>" + loadingTexts.join("<br/><br/>");
        };

        const promises: Promise<any>[] = [];

        // for load .bvmd file, we use BvmdLoader. if you want to load .vmd or .vpd file, use VmdLoader / VpdLoader
        const bvmdLoader = new BvmdLoader(scene);
        bvmdLoader.loggingEnabled = true;

        // you need to get this file by yourself from https://www.nicovideo.jp/watch/sm41164308
        promises.push(bvmdLoader.loadAsync("motion", "https://asset.localhost/mmd/【芙宁娜】_by_原神/motion.bvmd",
            (event) => updateLoadingText(0, `Loading motion... ${event.loaded}/${event.total} (${Math.floor(event.loaded * 100 / event.total)}%)`))
        );

        // you need to get this file by yourself from https://www.deviantart.com/sanmuyyb/art/YYB-Hatsune-Miku-10th-DL-702119716
        promises.push(SceneLoader.ImportMeshAsync(
            undefined,
            "https://asset.localhost/mmd/【芙宁娜】_by_原神/",
            "【芙宁娜】.bpmx",
            scene,
            (event) => updateLoadingText(1, `Loading model... ${event.loaded}/${event.total} (${Math.floor(event.loaded * 100 / event.total)}%)`)
        ));

        promises.push((async(): Promise<void> => {
            updateLoadingText(2, "Loading physics engine...");
            const havokInstance = await havokPhysics();
            const havokPlugin = new HavokPlugin(true, havokInstance);
            scene.enablePhysics(new Vector3(0, -98 * worldScale, 0), havokPlugin);
            updateLoadingText(2, "Loading physics engine... Done");
        })());

        // wait for all promises. parallel loading is faster than sequential loading.
        const [mmdAnimation, { meshes: [modelMesh] }] = await Promise.all(promises);
        if (!((_mmdAnimation: any): _mmdAnimation is MmdAnimation => true)(mmdAnimation)) throw new Error("unreachable");
        if (!((_mesh: any): _mesh is MmdMesh => true)(modelMesh)) throw new Error("unreachable");

        // hide loading screen
        scene.onAfterRenderObservable.addOnce(() => engine.hideLoadingUI());

        mmdRuntime.setCamera(mmdCamera);
        mmdCamera.addAnimation(mmdAnimation);
        mmdCamera.setAnimation("motion");

        {
            modelMesh.parent = mmdRoot;

            for (const mesh of modelMesh.metadata.meshes) shadowGenerator.addShadowCaster(mesh);
            modelMesh.receiveShadows = true;

            const mmdModel = mmdRuntime.createMmdModel(modelMesh);
            mmdModel.addAnimation(mmdAnimation);
            mmdModel.setAnimation("motion");

            // make sure directional light follow the model
            const bodyBone = mmdModel.runtimeBones.find((bone) => bone.name === "センター");
            const boneWorldMatrix = new Matrix();

            scene.onBeforeRenderObservable.add(() => {
                bodyBone!.getWorldMatrixToRef(boneWorldMatrix).multiplyToRef(modelMesh.getWorldMatrix(), boneWorldMatrix);
                boneWorldMatrix.getTranslationToRef(directionalLight.position);
                directionalLight.position.y -= 10 * worldScale;
            });
        }

        // optimize scene when all assets are loaded
        scene.onAfterRenderObservable.addOnce(() => {
            scene.freezeMaterials();

            const meshes = scene.meshes;
            for (let i = 0, len = meshes.length; i < len; ++i) {
                const mesh = meshes[i];
                mesh.freezeWorldMatrix();
                mesh.doNotSyncBoundingInfo = true;
                mesh.isPickable = false;
                mesh.doNotSyncBoundingInfo = true;
                mesh.alwaysSelectAsActiveMesh = true;
            }

            scene.skipPointerMovePicking = true;
            scene.skipPointerDownPicking = true;
            scene.skipPointerUpPicking = true;
            scene.skipFrustumClipping = true;
            scene.blockMaterialDirtyMechanism = true;
        });

        // if you want ground collision, uncomment following lines.
        // const groundRigidBody = new PhysicsBody(ground, PhysicsMotionType.STATIC, true, scene);
        // groundRigidBody.shape = new PhysicsShapeBox(
        //     new Vector3(0, -1, 0),
        //     new Quaternion(),
        //     new Vector3(100, 2, 100), scene);

        const defaultPipeline = new DefaultRenderingPipeline("default", true, scene, [mmdCamera, camera]);
        defaultPipeline.samples = 4;
        defaultPipeline.bloomEnabled = false;
        defaultPipeline.chromaticAberrationEnabled = true;
        defaultPipeline.chromaticAberration.aberrationAmount = 1;
        defaultPipeline.depthOfFieldEnabled = false;
        defaultPipeline.fxaaEnabled = true;

        // switch camera when double click
        let lastClickTime = -Infinity;
        canvas.onclick = (): void => {
            const currentTime = performance.now();
            if (500 < currentTime - lastClickTime) {
                lastClickTime = currentTime;
                return;
            }

            lastClickTime = -Infinity;

            if (scene.activeCamera === mmdCamera) {
                scene.activeCamera = camera;
            } else {
                scene.activeCamera = mmdCamera;
            }
        };

        // if you want to use inspector, uncomment following line.
        // Inspector.Show(scene, { });

        // webxr experience for AR
        const webXrExperience = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: "immersive-ar",
                referenceSpaceType: "local-floor"
            }
        });
        webXrExperience;
        // webXrExperience.baseExperience?.sessionManager.onXRSessionInit.add(() => {
        //     defaultPipeline.addCamera(webXrExperience.baseExperience.camera);
        // });

        return scene;
    }
}