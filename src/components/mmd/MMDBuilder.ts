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
import "babylon-mmd/esm/Loader/pmxLoader";
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
import { Color4 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { DefaultRenderingPipeline } from "@babylonjs/core/PostProcesses/RenderPipeline/Pipelines/defaultRenderingPipeline";
import { Scene } from "@babylonjs/core/scene";
import { MmdAnimation } from "babylon-mmd/esm/Loader/Animation/mmdAnimation";
import type { MmdStandardMaterialBuilder } from "babylon-mmd/esm/Loader/mmdStandardMaterialBuilder";
import type { PmxLoader } from "babylon-mmd/esm/Loader/pmxLoader";
import { VmdLoader } from "babylon-mmd/esm/Loader/vmdLoader";
import { SdefInjector } from "babylon-mmd/esm/Loader/sdefInjector";
import { StreamAudioPlayer } from "babylon-mmd/esm/Runtime/Audio/streamAudioPlayer";
import { MmdCamera } from "babylon-mmd/esm/Runtime/mmdCamera";
import type { MmdMesh } from "babylon-mmd/esm/Runtime/mmdMesh";
import { MmdRuntime } from "babylon-mmd/esm/Runtime/mmdRuntime";

import type { ISceneBuilder, AliveMmdOptions } from "./MMDRuntime";

import { listen } from "@tauri-apps/api/event";

type InAnimationLoop = (mmdDancing: boolean) => void;

export class SceneBuilder implements ISceneBuilder {
    private _mmdDancing: boolean = false;
    private _currDuration: number = 0;
    private _loopId: any;
    private _options: AliveMmdOptions = {
        mmdAliveUrl: "mmdAliveUrl",
        mmdCamera: true,
        paused: false,
        muted: false
    };

    public async build(canvas: HTMLCanvasElement, engine: Engine, aliveMmdOptions: AliveMmdOptions): Promise<Scene> {
        console.log("SceneBuilder build");
        this._options = aliveMmdOptions;

        const mmdAliveUrl = this._options.mmdAliveUrl

        // 加载 alive_mmd 设置
        const sets = await fetch(mmdAliveUrl).then((response) => response.json());
        console.log("sets: ", sets);
        const lastSlash = mmdAliveUrl.lastIndexOf('/');
        const baseUrl = mmdAliveUrl.substring(0, lastSlash + 1);
        const interval: number = sets.interval;
        console.log("baseUrl: ", baseUrl);
        const aliveMotions: any[] = sets.alive_motions;

        // 加载中显示
        const loadingTexts: string[] = [];
        const updateLoadingText = (updateIndex: number, text: string): void => {
            loadingTexts[updateIndex] = text;
            engine.loadingUIText = "<br/><br/><br/><br/>" + loadingTexts.join("<br/><br/>");
        };

        // for apply SDEF on shadow, outline, depth rendering
        SdefInjector.OverrideEngineCreateEffect(engine);

        // get pmx loader and set some configurations.
        const pmxLoader = SceneLoader.GetPluginForExtension(".pmx") as PmxLoader;
        pmxLoader.loggingEnabled = true;
        const materialBuilder = pmxLoader.materialBuilder as MmdStandardMaterialBuilder;

        // if you want override texture loading, uncomment following lines.
        // materialBuilder.loadDiffuseTexture = (): void => { /* do nothing */ };
        // materialBuilder.loadSphereTexture = (): void => { /* do nothing */ };
        // materialBuilder.loadToonTexture = (): void => { /* do nothing */ };

        // if you need outline rendering, comment out following line.
        materialBuilder.loadOutlineRenderingProperties = (): void => { /* do nothing */ };

        const scene = new Scene(engine);
        scene.autoClear = false
        scene.clearColor = new Color4(1, 1, 1, 0);

        // scaling for WebXR
        const worldScale = 0.09;

        const mmdRoot = new TransformNode("mmdRoot", scene);
        mmdRoot.scaling.scaleInPlace(worldScale);
        mmdRoot.position.z = 1;

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
        camera.speed = .5 * worldScale;

        const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(0, 1, 0), scene);
        hemisphericLight.intensity = 0.4;
        hemisphericLight.specular.set(0, 0, 0);
        hemisphericLight.groundColor.set(1, 1, 1);

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

        const shadowGenerator = new ShadowGenerator(2048, directionalLight, true, mmdCamera);
        shadowGenerator.usePercentageCloserFiltering = true;
        shadowGenerator.forceBackFacesOnly = true;
        shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
        shadowGenerator.frustumEdgeFalloff = 0.1;

        // const ground = MeshBuilder.CreateGround("ground1", { width: 60, height: 60, subdivisions: 2, updatable: false }, scene);
        // ground.receiveShadows = true;
        // shadowGenerator.addShadowCaster(ground);

        // 加载 mmd 背景
        const backgrounds: string[] = sets.default_bg;
        backgrounds.forEach(async (background) => {
            const trueUrl = this.resolveRelativePath(baseUrl, background);
            console.log("trueUrl 2: ", trueUrl);

            const mmdBackground = await SceneLoader.ImportMeshAsync(
                "",
                trueUrl,
                "",
                scene,
                (event) => updateLoadingText(1, `Loading background... ${event.loaded}/${event.total} (${Math.floor(event.loaded * 100 / event.total)}%)`)
            )
                .then((result) => result.meshes[0] as MmdMesh);
            for (const mesh of mmdBackground.metadata.meshes) {
                mesh.receiveShadows = true;
            }
            shadowGenerator.addShadowCaster(mmdBackground);
        })
        
        // 启用物理效果
        // scene.enablePhysics(new Vector3(0, -9.8 * 10, 0), new HavokPlugin(true, await havokPhysics()));
        // const mmdRuntime = new MmdRuntime(scene, new MmdPhysics(scene));
        const mmdRuntime = new MmdRuntime(scene);
        mmdRuntime.loggingEnabled = true
        mmdRuntime.register(scene);
        
        // 音频
        const audioPlayer = new StreamAudioPlayer(scene);
        audioPlayer.preservesPitch = false;
        mmdRuntime.setAudioPlayer(audioPlayer);

        const promises: Promise<any>[] = [];

        // 加载 vmd 动作
        const vmdLoader = new VmdLoader(scene);
        vmdLoader.loggingEnabled = true;

        aliveMotions.forEach((aliveMotion) => {
            promises.push(vmdLoader.loadAsync(aliveMotion.motion_name, this.getMotionUrl(baseUrl, aliveMotion.motions),
                (event) => updateLoadingText(0, `Loading motion... ${event.loaded}/${event.total} (${Math.floor(event.loaded * 100 / event.total)}%)`))
            );
        })

        // 加载 mmd 模型
        const aliveMmdModel: string = sets.mmd_model;
        promises.push(SceneLoader.ImportMeshAsync(
            aliveMmdModel.replace(".pmx", ""),
            baseUrl + aliveMmdModel,
            "",
            scene,
            (event) => updateLoadingText(1, `Loading model... ${event.loaded}/${event.total} (${Math.floor(event.loaded * 100 / event.total)}%)`)
        ));

        // 物理效果
        // promises.push((async(): Promise<void> => {
        //     updateLoadingText(2, "Loading physics engine...");
        //     const havokInstance = await havokPhysics();
        //     const havokPlugin = new HavokPlugin(true, havokInstance);
        //     scene.enablePhysics(new Vector3(0, -98 * worldScale, 0), havokPlugin);
        //     updateLoadingText(2, "Loading physics engine... Done");
        // })());


        // 等待所有加载完成. parallel loading is faster than sequential loading.
        const [mmdAnimations, { meshes: [modelMesh] }] = await Promise.all(promises).then((values) => {
            const motions: MmdAnimation[] = [];
            var mmdMeshs: any;
            values.forEach((value) => {
                if (value instanceof MmdAnimation) {
                    motions.push(value)
                } else {
                    mmdMeshs = value
                }
            })
            return [motions, mmdMeshs]
        });
        // if (!((_mmdAnimation: any): _mmdAnimation is MmdAnimation => true)(mmdAnimation)) throw new Error("unreachable");
        if (!((_mesh: any): _mesh is MmdMesh => true)(modelMesh)) throw new Error("unreachable");

        // 隐藏加载显示
        scene.onAfterRenderObservable.addOnce(() => engine.hideLoadingUI());

        mmdRuntime.setCamera(mmdCamera);
        mmdAnimations.forEach((mmdAnimation: MmdAnimation) => {
            mmdCamera.addAnimation(mmdAnimation);
        })
        const currMotion = this.randomAnimation(sets.pose_motions);
        const alive = aliveMotions.find((aliveMotion) => currMotion === aliveMotion.motion_name)

        if (alive.bgm !== "") {
            const trueUrl = this.resolveRelativePath(baseUrl, alive.bgm);
            audioPlayer.source = trueUrl;
        }
        mmdCamera.setAnimation(currMotion);
        // 加载设置。
        if (this._options.paused) {
            mmdRuntime.pauseAnimation();
        } else {
            mmdRuntime.playAnimation();
        }
        if (this._options.muted) {
            if (!audioPlayer.muted) {
                audioPlayer.mute();
            }
        } else {
            audioPlayer.unmute();
        }
        if (this._options.mmdCamera) {
            scene.activeCamera = mmdCamera;
        } else {
            scene.activeCamera = camera;
        }

        modelMesh.parent = mmdRoot;
        // 添加阴影
        for (const mesh of modelMesh.metadata.meshes) shadowGenerator.addShadowCaster(mesh);
        modelMesh.receiveShadows = true;

        const mmdModel = mmdRuntime.createMmdModel(modelMesh);
        mmdAnimations.forEach((mmdAnimation: MmdAnimation) => {
            mmdModel.addAnimation(mmdAnimation);
        })
        mmdModel.setAnimation(currMotion);
        this._currDuration = mmdRuntime.animationDuration * 1000 + interval;

        // 动作循环
        const animteLoop: InAnimationLoop = (mmdDancing) => {
            audioPlayer.currentTime = 0;
            
            // 重置 mmd 相机位置，防止没有相机动作时相机位置错误
            mmdCamera.position = new Vector3(0, 10, 0);
            mmdCamera.rotation = new Vector3(0, 0, 0);
            mmdCamera.distance = -33;
            
            const nextMotion = this.randomAnimation(mmdDancing ? sets.dance_motions : sets.pose_motions);
            const alive = aliveMotions.find((aliveMotion) => nextMotion === aliveMotion.motion_name)
            if (alive.bgm !== "") {
                const trueUrl = this.resolveRelativePath(baseUrl, alive.bgm);
                audioPlayer.source = trueUrl;
            }
            mmdRuntime.seekAnimation(0);
            mmdCamera.setAnimation(nextMotion);
            mmdCamera.animate(0);
            mmdModel.setAnimation(nextMotion);
            this._currDuration = mmdRuntime.animationDuration * 1000 + interval;
            console.log("_currDuration:", this._currDuration);
            console.log("currentFrameTime:", mmdRuntime.currentFrameTime);

            mmdRuntime.playAnimation();
        }
        this.animationLoop(animteLoop);

        // make sure directional light follow the model
        const bodyBone = mmdModel.runtimeBones.find((bone) => bone.name === "センター");
        const boneWorldMatrix = new Matrix();

        scene.onBeforeRenderObservable.add(() => {
            bodyBone!.getWorldMatrixToRef(boneWorldMatrix).multiplyToRef(modelMesh.getWorldMatrix(), boneWorldMatrix);
            boneWorldMatrix.getTranslationToRef(directionalLight.position);
            directionalLight.position.y -= 10 * worldScale;
        });


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

        // const defaultPipeline = new DefaultRenderingPipeline("default", true, scene, [mmdCamera, camera]);
        // defaultPipeline.samples = 4;
        // defaultPipeline.bloomEnabled = false;
        // defaultPipeline.chromaticAberrationEnabled = true;
        // defaultPipeline.chromaticAberration.aberrationAmount = 1;
        // defaultPipeline.depthOfFieldEnabled = false;
        // defaultPipeline.fxaaEnabled = true;

        // if you want to use inspector, uncomment following line.
        // Inspector.Show(scene, { });

        await listen('event_change_camera', (event: any) => {
            console.log("event_change_camera");
            this._options.mmdCamera = !this._options.mmdCamera;
            if (this._options.mmdCamera) {
                scene.activeCamera = mmdCamera;
            } else {
                scene.activeCamera = camera;
            }
        });
        await listen('event_pause_animation', (event: any) => {
            const isPaused = event.payload as boolean
            this._options.paused = isPaused;
            console.log("event_pause_animation ", isPaused);
            if (isPaused) {
                mmdRuntime.pauseAnimation();
                clearTimeout(this._loopId);
            } else {
                mmdRuntime.playAnimation();
                // 重新设置定时器
                this.animationLoop(animteLoop);
            }
        });
        await listen('event_mmd_voice', (event: any) => {
            const muted = event.payload as boolean
            this._options.muted = muted;
            console.log("event_mmd_voice ", muted);
            if (this._options.muted) {
                if (!audioPlayer.muted) {
                    audioPlayer.mute();
                }
            } else {
                audioPlayer.unmute();
            }
        });
        await listen('event_mmd_dancing', (event: any) => {
            const dancing = event.payload as boolean;
            
            mmdRuntime.pauseAnimation();
            mmdRuntime.seekAnimation(0);
            // 重置 mmd 相机位置，防止没有相机动作时相机位置错误
            mmdCamera.position = new Vector3(0, 10, 0);
            mmdCamera.rotation = new Vector3(0, 0, 0);
            mmdCamera.distance = -30;
            this._mmdDancing = dancing;

            // 清除掉定时器，不然定时器到时间后就会切换动画
            clearTimeout(this._loopId);

            const nextMotion = this.randomAnimation(dancing ? sets.dance_motions : sets.pose_motions);
            const alive = aliveMotions.find((aliveMotion) => nextMotion === aliveMotion.motion_name)
            if (alive.bgm !== "") {
                const trueUrl = this.resolveRelativePath(baseUrl, alive.bgm);
                audioPlayer.source = trueUrl;
            }

            mmdCamera.setAnimation(nextMotion);
            mmdModel.setAnimation(nextMotion);
            this._currDuration = mmdRuntime.animationDuration * 1000 + interval;

            mmdRuntime.playAnimation();
            console.log("mmdRuntime animationDuration:", mmdRuntime.animationDuration);

            // 重新设置定时器
            this.animationLoop(animteLoop);
        });













        // const mmdMesh = await SceneLoader.ImportMeshAsync("", baseUrl + sets.mmd_model, "", scene)
        //     .then((result) => result.meshes[0] as MmdMesh);
        // for (const mesh of mmdMesh.metadata.meshes) mesh.receiveShadows = true;
        // shadowGenerator.addShadowCaster(mmdMesh);

        return scene;
    }

    private getMotionUrl(baseUrl: string, motions: string[]): string[] {
        const motionUrls: string[] = [];

        motions.forEach(
            (motion) => {
                const trueUrl = this.resolveRelativePath(baseUrl, motion);
                console.log("trueUrl 1: ", trueUrl);
                motionUrls.push(trueUrl);
            }
        )
        return motionUrls;
    }
    private randomAnimation(motions: string[]): string {
        if (motions.length === 0) {
            return "";
        }
        var rand = Math.floor(Math.random() * motions.length);
        return motions[rand];
    }
    private animationLoop(loop: InAnimationLoop) {
        this._loopId = setTimeout(() => {
            console.log("next animation.");
            // 一个动作完成。
            loop(this._mmdDancing);
            this.animationLoop(loop);
        }, this._currDuration);
    }
    private resolveRelativePath(base: string, relative: string): string {
        const baseUrl = new URL(base);
        const resolvedUrl = new URL(relative, baseUrl);

        return "https://asset.localhost" + resolvedUrl.pathname;
    }
}