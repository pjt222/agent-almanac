---
name: analyze-tensegrity-system
description: >
  Analyze a tensegrity system by identifying compression struts and tension
  cables, classifying type (class 1/2, biological/architectural), computing
  prestress equilibrium, verifying stability via Maxwell's rigidity criterion,
  and mapping biological tensegrity (microtubules, actin, intermediate
  filaments). Use when evaluating tensegrity in architecture, robotics,
  cell biology, or any system with isolated compression in continuous tension.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tensegrity
  complexity: advanced
  language: natural
  tags: tensegrity, structural-integrity, prestress, biomechanics, cytoskeleton, force-balance
  locale: ja
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Analyze Tensegrity System

テンセグリティ（張力的統合）システムを解析する — 孤立した圧縮要素（ストラット）が連続的な張力ネットワーク（ケーブル/腱）によって安定化される構造である。システムの力のバランス、プレストレス平衡、構造的安定性、そして分子レベルの細胞骨格から建築形態に至るまでのスケール横断的な一貫性を判定する。

## 使用タイミング

- 構造が真のテンセグリティ（圧縮・張力分離）を示すか、それとも従来型フレームかを評価するとき
- 建築、ロボティクス、展開構造におけるテンセグリティ設計の構造的安定性を解析するとき
- Donald Ingber の細胞テンセグリティモデルを細胞骨格力学（微小管、アクチン、中間径フィラメント）に適用するとき
- 既存のテンセグリティシステムの荷重容量と破壊モードを評価するとき
- 生物学的構造（細胞、組織、筋骨格系）がテンセグリティとしてモデル化できるかを判定するとき
- 従来トラスより多くのメカニズム（自由度）を持つにもかかわらず剛性を達成するためのプレストレス要件を計算するとき

## 入力

- **必須**: システムの記述（物理構造、生物学的細胞、建築モデル、ロボット機構）
- **必須**: 候補となる圧縮要素と張力要素の特定
- **任意**: 材料特性（各要素のヤング率、断面、長さ）
- **任意**: 外部荷重と境界条件
- **任意**: 関心スケール（分子、細胞、組織、建築）
- **任意**: 既知のトポロジーファミリー（プリズム、八面体、二十面体、X モジュール）

## 手順

### ステップ1: システムを特性化する

すべての圧縮要素（ストラット）と張力要素（ケーブル）、それらの接続性、境界条件を特定して、完全な物理的記述を確立する。

1. **圧縮インベントリ**: すべてのストラットを列挙する — 圧縮に抵抗する剛性要素。各ストラットの長さ、断面、材質、ヤング率を記録する。生物システムでは微小管を特定する（中空円筒、外径 ~25 nm、内径 14 nm、E ~ 1.2 GPa、persistence length ~ 5 mm）。
2. **張力インベントリ**: すべてのケーブルを列挙する — 張力にのみ抵抗し圧縮下では弛緩する要素。静止長、断面積、引張剛性を記録する。生物システムでは: アクチンフィラメント（らせん状、~7 nm 径、E ~ 2.6 GPa、persistence length ~ 17 um）と中間径フィラメント（IFs、~10 nm 径、高伸長性、ひずみ硬化性）。
3. **接続性トポロジー**: どのストラットがどのケーブルとどのノード（ジョイント）で接続するかを文書化する。トポロジーをエンコードした接続行列 C（行=メンバー、列=ノード）を構築する。
4. **境界条件**: 固定ノード（接地ジョイント）、自由ノード、外部荷重を特定する。重力荷重の方向と大きさを記録する。
5. **スケールの特定**: 分子（nm）、細胞（um）、建築（m）、ロボット（cm-m）のいずれかに分類する。

```markdown
## System Characterization
| ID | Type  | Length   | Cross-section | Material       | Stiffness     |
|----|-------|----------|---------------|----------------|---------------|
| S1 | strut | [value]  | [value]       | [material]     | E = [value]   |
| C1 | cable | [value]  | [value]       | [material]     | EA = [value]  |
- **Nodes**: [count], [fixed vs. free]
- **Scale**: [molecular / cellular / architectural / robotic]
- **Boundary conditions**: [description]
```

**期待結果：** 材料特性付きのすべての圧縮・張力要素の完全なインベントリ、接続行列、平衡方程式を立てるのに十分な境界条件。

**失敗時：** 要素特性が不明な場合（生物システムでは一般的）、公表値を使う: 微小管（E ~ 1.2 GPa、persistence length ~ 5 mm）、アクチン（E ~ 2.6 GPa、persistence length ~ 17 um）、中間径フィラメント（強い非線形性、低初期係数 ~1 MPa から高ひずみで ~1 GPa へとひずみ硬化）。接続性が不明確なら、本質的な力経路を捉える最も単純なトポロジーへ縮退させる。

### ステップ2: テンセグリティのタイプを分類する

システムが属するテンセグリティのクラスと、生物学的か工学的かを判定する。

1. **クラス判定**:
   - **クラス1**: ストラットが互いに接触しない — すべてのストラットは孤立し、張力ネットワークを介してのみ接続される。Fuller/Snelson 構造の多くはクラス1。
   - **クラス2**: ストラットが共有ノードで接触してよい。多くの生物システムはクラス2（微小管が中心体接続点を共有する）。
2. **トポロジーの特定**: b = 総メンバー数（ストラット + ケーブル）、j = ノード数を数える。トポロジーが既知ファミリーに一致するか特定する: テンセグリティプリズム（3 ストラット、6 ケーブルの三角反プリズム）、拡張八面体（6 ストラット、24 ケーブル）、二十面体テンセグリティ（30 ストラット、90 ケーブル）、X モジュール（基本 2D 単位セル）。
3. **生物学的 vs 工学的**: 生物テンセグリティは特有の特徴を持つ: 圧縮要素は離散的で剛性（微小管）、張力ネットワークは連続的（アクチン皮質 + IFs）、プレストレスは能動的に生成（ATP 加水分解を介したアクトミオシン収縮性）、システムはメカノトランスダクション（力から信号への変換）を示す。どの特徴が存在するかを文書化する。
4. **次元**: 2D（平面）か 3D かを分類する。

```markdown
## Tensegrity Classification
- **Class**: [1 (isolated struts) / 2 (strut-strut contact)]
- **Dimension**: [2D / 3D]
- **Topology**: [prism / octahedron / icosahedron / X-module / irregular]
- **Category**: [biological / architectural / robotic / artistic]
- **b** (members): [value], **j** (nodes): [value]

### Biological Tensegrity Mapping (if applicable)
| Cell Component          | Tensegrity Role       | Key Properties                              |
|-------------------------|-----------------------|---------------------------------------------|
| Microtubules            | Compression struts    | 25 nm OD, E~1.2 GPa, dynamic instability    |
| Actin filaments         | Tension cables        | 7 nm, cortical network, actomyosin contract. |
| Intermediate filaments  | Deep tension/prestress| 10 nm, strain-stiffening, nucleus-to-membrane|
| Extracellular matrix    | External anchor       | Collagen/fibronectin, integrin attachment     |
| Focal adhesions         | Ground nodes          | Mechanosensitive, connect cytoskeleton to ECM |
| Nucleus                 | Internal compression  | Lamina network forms sub-tensegrity           |
```

**期待結果：** 明確な分類（クラス、次元、カテゴリ）。生物システムでは生物学的マッピング表が完成している。工学システムではトポロジーファミリーが特定されている。

**失敗時：** システムがクラス1にもクラス2にもきれいに収まらない場合、ハイブリッドか従来型フレームかもしれない。真のテンセグリティには、少なくとも一部の要素が張力のみで働く（圧縮下で弛緩するケーブル）ことが必要。張力専用要素がなければそれはテンセグリティではない — 従来型トラスまたはフレームに再分類し、標準構造解析を適用する。

### ステップ3: 力のバランスとプレストレス平衡を解析する

各ノードでの静的平衡を計算し、プレストレス状態（外部荷重なしでの内部張力/圧縮）を判定し、すべてのケーブルが張力下にあることを検証する。

1. **平衡行列を構築**: d 次元の b メンバー、j ノードに対して、平衡行列 A（サイズ dj x b）を構築する。各列は両端ノードでのメンバーの力寄与の方向余弦をエンコードする。平衡方程式は A * t = f_ext、ここで t はメンバーの力密度ベクトル（力/長さ）、f_ext は外部荷重ベクトル。
2. **自己応力（self-stress）を解く**: f_ext = 0 として A の零空間を求める。null(A) の各基底ベクトルは自己応力状態 — 外部荷重なしで平衡を満たす内部力。独立な自己応力状態の数は s = b - rank(A)。
3. **ケーブル張力を検証**: 任意の有効なテンセグリティ自己応力では、すべてのケーブルが正の力密度（張力）を持ち、すべてのストラットが負の力密度（圧縮）を持たねばならない。ケーブルを圧縮状態にする自己応力は物理的に実現不能（ケーブルは弛緩する）。
4. **プレストレスレベルを計算**: 実際のプレストレスは、すべてのケーブル張力が正となるよう選ばれた自己応力基底ベクトルの線形結合。最小ケーブル張力 t_min（任意のケーブルが弛緩する前のマージン）を記録する。
5. **荷重容量**: 外部荷重を加えて A * t = f_ext を解く。最初のケーブル張力がゼロに達する荷重が臨界荷重 F_crit。

```markdown
## Prestress Equilibrium
- **Equilibrium matrix A**: [dj] x [b] = [size]
- **Rank of A**: [value]
- **Self-stress states (s)**: s = b - rank(A) = [value]
- **Self-stress feasibility**: [all cables in tension? Yes/No]
- **Minimum cable tension**: t_min = [value]
- **Critical external load**: F_crit = [value]

| Member | Type  | Force Density | Force   | Status      |
|--------|-------|---------------|---------|-------------|
| S1     | strut | [negative]    | [value] | compression |
| C1     | cable | [positive]    | [value] | tension     |
```

**期待結果：** 自己応力状態が計算され、物理的に実現可能なプレストレス（全ケーブル張力下、全ストラット圧縮下）が見出され、荷重容量が見積もられている。

**失敗時：** 全ケーブルを張力下に保つ自己応力状態が見つからない場合、トポロジーはテンセグリティのプレストレスを支持しない。(a) 接続行列に誤りがある、(b) システムには追加のケーブルが必要、(c) テンセグリティではなく機構である、のいずれか。大規模システムでは手計算ではなく力密度法（Schek, 1974）または数値零空間計算を使う。

### ステップ4: Maxwell の判定法で安定性を確認する

テンセグリティが剛（無限小摂動に対して安定）か機構（ゼロエネルギー変形モードを持つ）かを判定する。

1. **拡張 Maxwell 則を適用**: d 次元のピン接合フレームワークで b バー、j ノード、k 運動学的拘束（支持）、s 自己応力状態、m 無限小機構について:

   **b - dj + k + s = m**

   これはバー、ジョイント、拘束を、自己応力と機構状態のバランスへ関連付ける。

2. **平衡行列から計算**: rank(A) = b - s。機構の数は m = dj - k - rank(A)。m = 0 なら構造は一次剛である。m > 0 ならプレストレス安定性を確認しなければならない。
3. **プレストレス安定性テスト**: 各機構モード q について二次エネルギー E_2 = q^T * G * q を計算する、ここで G は幾何剛性行列（応力行列）。すべての機構モードで E_2 > 0 なら、テンセグリティはプレストレス安定（Connelly and Whiteley, 1996）。これがテンセグリティが剛性を達成する仕方である — バー数によってではなく、機構のプレストレスによる安定化によって。
4. **剛性を分類**:
   - **運動学的に決定**: m = 0、s = 0（テンセグリティでは稀）
   - **静的不定で剛**: m = 0、s > 0
   - **プレストレス安定**: m > 0、しかしすべての機構がプレストレスで安定化される
   - **機構**: m > 0、安定化されない（構造は変形可能）

```markdown
## Stability Analysis (Maxwell's Criterion)
- **Bars (b)**: [value]
- **Joints (j)**: [value]
- **Dimension (d)**: [2 or 3]
- **Kinematic constraints (k)**: [value]
- **Rank of A**: [value]
- **Self-stress states (s)**: [value]
- **Mechanisms (m)**: [value]
- **Maxwell check**: b - dj + k + s = m --> [values]
- **Prestress stability**: [stable / unstable / N/A]
- **Rigidity class**: [determinate / indeterminate / prestress-stable / mechanism]
```

**期待結果：** Maxwell カウントが行われ、機構が判定され、m > 0 についてはプレストレス安定性が評価された。構造は剛、プレストレス安定、または機構として分類される。

**失敗時：** 構造が機構（m > 0 でプレストレス安定でない）である場合の選択肢: (a) ケーブルを追加して b を増やし m を減らす、(b) プレストレスを増やす、(c) トポロジーを変更する。生物システムでは能動的なアクトミオシン収縮性が安定性を維持するためプレストレスを連続的に調整する — 細胞は自己調整型のテンセグリティである。

### ステップ5: 生物テンセグリティのマッピング（スケール横断解析）

システムが生物学的解釈を持つなら、解析を Ingber の細胞テンセグリティモデルにマッピングし、スケール横断的な一貫性を確認する。純粋に工学的なシステムではこのステップはスキップする。

1. **分子スケール（nm）**: タンパク質フィラメントをテンセグリティ要素として特定する。微小管（α/β-チューブリンヘテロ二量体、GTP 依存重合、カタストロフィー/レスキューを伴う動的不安定性）。アクチン（G アクチン → F アクチン重合、トレッドミル運動）。中間径フィラメント（タイプ依存: ビメンチン、ケラチン、デスミン、核ラミン）。
2. **細胞スケール（um）**: 全細胞テンセグリティをマッピングする。アクチン皮質 = 連続張力シェル。中心体から放射する微小管 = 皮質に対して圧縮を担うストラット。IFs = 核を接着斑へ接続する二次張力経路。アクトミオシン収縮性（ミオシン II モータータンパク質）= 能動プレストレス生成器。
3. **組織スケール（mm-cm）**: 細胞は高次のテンセグリティを形成する。各細胞は連続的な ECM 張力ネットワーク（コラーゲン、エラスチン）で接続された圧縮担持要素として作用する。細胞間接合（カドヘリン）と細胞-ECM 接合（インテグリン）がノードを果たす。
4. **スケール横断的一貫性**: 一つのスケールでの摂動が他へ伝播することを検証する。ECM での外部力はインテグリンを介して細胞骨格、核へと伝達される — このメカノトランスダクション経路はスケール横断テンセグリティの署名である。

```markdown
## Cross-Scale Biological Tensegrity
| Scale      | Compression        | Tension              | Prestress Source      | Nodes              |
|------------|--------------------|----------------------|-----------------------|--------------------|
| Molecular  | Tubulin dimers     | Actin/IF subunits    | ATP/GTP hydrolysis    | Protein complexes  |
| Cellular   | Microtubules       | Actin cortex + IFs   | Actomyosin            | Focal adhesions    |
| Tissue     | Cells (turgor)     | ECM (collagen)       | Cell contractility    | Cell-ECM junctions |
| Organ      | Bones              | Muscles + fascia     | Muscle tone           | Joints             |

### Mechanotransduction Pathway
ECM --> integrin --> focal adhesion --> actin cortex --> IF --> nuclear lamina --> chromatin
```

**期待結果：** 各関連スケールで生物テンセグリティがマッピングされ、圧縮、張力、プレストレス源、ノードが特定されている。スケール横断的力伝達が文書化されている。

**失敗時：** スケール横断マッピングが破綻する場合（スケール間に明確な張力連続性がない）、ギャップを文書化する。すべての生物構造がすべてのスケールでテンセグリティであるわけではない。脊柱は筋骨格レベルではテンセグリティ（骨=ストラット、筋肉/筋膜=ケーブル）だが、個々の椎骨は内部的には従来型の圧縮構造である。

### ステップ6: 解析を統合し、構造的整合性を評価する

それまでのすべての解析を統合し、システムの張力的整合性についての最終評価を行う。

1. **力のバランス概要**: プレストレス平衡が達成されているか、剛性分類、荷重容量マージンを述べる。
2. **脆弱性解析**: クリティカルメンバーを特定する — 失敗が整合性の最大の損失をもたらすケーブル（強度に対する力密度が最も高いもの）、座屈すれば崩壊を引き起こすストラット（オイラー座屈に対して確認: P_cr = pi^2 * EI / L^2）。
3. **冗長性評価**: s が 0 に落ちる前にいくつのケーブルを除去できるか？システムが安定化されない機構になる前にいくつまでか？
4. **設計推奨**（工学システム）: ケーブルプリテンションレベル、ストラットサイジング、マージン改善のためのトポロジー変更。
5. **生物学的含意**（生物システム）: 病態生理に関連付ける — 微小管安定性の低下（コルヒチン/タキソール）、IF ネットワークの破壊（laminopathies）、プレストレスの変化（収縮性増大による癌細胞の力学）。
6. **整合性評価**:
   - **ROBUST**: s >= 2、すべてのケーブルが弛緩閾値よりかなり上、クリティカルメンバーの失敗が崩壊を引き起こさない
   - **MARGINAL**: s = 1、または期待荷重下で最小ケーブル張力がゼロ近く
   - **FRAGILE**: s = 0、またはクリティカルメンバーの失敗がシステム崩壊を引き起こす

```markdown
## Structural Integrity Assessment
- **Prestress equilibrium**: [achieved / not achieved]
- **Rigidity**: [determinate / indeterminate / prestress-stable / mechanism]
- **Load capacity margin**: [value or qualitative]
- **Critical member**: [ID] -- failure causes [consequence]
- **Redundancy**: [cables removable before mechanism]
- **Integrity rating**: [ROBUST / MARGINAL / FRAGILE]

### Recommendations
1. [specific recommendation]
2. [specific recommendation]
3. [specific recommendation]
```

**期待結果：** 剛性分類、脆弱性特定、冗長性解析、整合性評価（ROBUST/MARGINAL/FRAGILE）と実行可能な推奨を伴う完全な構造的整合性評価。

**失敗時：** 解析が不完全（平衡行列が大きすぎる、生物パラメータが不明）な場合、評価を条件付きとして述べる: 「数値検証待ちの MARGINAL」または「分類にはプレストレスレベルの実験計測が必要」。明示的なギャップを伴う部分的評価は、評価なしより価値がある。

## バリデーション

- [ ] すべての圧縮要素（ストラット）と張力要素（ケーブル）が特性付きでインベントリされている
- [ ] 接続性トポロジーが文書化されている（接続行列または同等物）
- [ ] テンセグリティクラス（1 または 2）がストラット接触に基づいて判定されている
- [ ] 平衡行列が構築されランクが計算されている
- [ ] 全ケーブルを張力下に保つ自己応力状態が少なくとも一つ見出されている
- [ ] Maxwell の拡張則が適用されている: b - dj + k + s = m
- [ ] 無限小機構（あれば）がプレストレス安定性で確認されている
- [ ] 剛性分類が割り当てられている
- [ ] 生物システムについてはスケール横断マッピング表が完成している
- [ ] 構造的整合性が ROBUST、MARGINAL、FRAGILE のいずれかとして根拠と共に評価されている

## よくある落とし穴

- **テンセグリティを従来トラスと混同する**: テンセグリティでは一部の要素が張力のみで働く必要がある（圧縮下で弛緩する）。すべての要素が張力と圧縮の両方を担えるなら、それはテンセグリティではなく従来型フレームである。ケーブルの一方向性が安定性のためにプレストレスを必要とする非線形性を生む。
- **安定性解析でプレストレスを無視する**: 応力なしのテンセグリティは常に機構である — 静止長のケーブルは剛性を提供しない。Maxwell カウント単独ではテンセグリティについてしばしば m > 0 を導き不安定性を示唆する。プレストレス安定性チェック（ステップ4）が必須: テンセグリティを剛にするのはプレストレスである。
- **生物テンセグリティを静的に扱う**: 細胞テンセグリティはアクチン上で収縮性を生む ATP 依存ミオシン II モーターによって能動的に維持される。プレストレスは動的であり固定ではない。静的解析は構造原理を捉えるが能動制御を見逃す。プレストレスが受動的（ケーブルプリテンション）か能動的（モーター生成）かを常に記す。
- **ケーブル弛緩を考慮せず Maxwell 則を適用**: Maxwell 則はすべてのメンバーがアクティブだと仮定する。ケーブルを弛緩させる外部荷重は実効 b を減らし安定性計算を変える。各荷重ケース下でどのケーブルが張ったままかを追跡する。
- **Snelson の彫刻と Ingber の細胞モデルを混同**: Snelson の芸術的テンセグリティは剛性の金属ストラットと鋼鉄ケーブルを使う。Ingber の細胞テンセグリティは粘弾性要素、能動制御、圧縮要素の動的不安定性（微小管カタストロフィー）を持つ。構造原理は同じだが、材料挙動は根本的に異なる。
- **ストラット座屈を無視する**: テンセグリティ解析はストラットを剛として扱う。細いストラットは座屈しうる（オイラー: P_cr = pi^2 * EI / L^2）。圧縮力が座屈荷重に近づくなら、剛性ストラット仮定は失敗し、実際の荷重容量は予測より低い。

## 関連スキル

- `assess-form` — 構造インベントリと変容準備性; assess-form は形式を一般的に評価するが、本スキルは圧縮・張力分解という特定のテンセグリティ枠組みを適用する
- `adapt-architecture` — 建築的変容; テンセグリティ解析は整合性が張力連続性に依存するかを特定し、変容中にどの要素が安全に修正可能かを示す
- `repair-damage` — 再生的回復; テンセグリティではケーブル失敗とストラット失敗は異なる結果をもたらし、クリティカルメンバー解析（ステップ6）が修復優先度を直接示す
- `center` — 動的推論バランス; 剛性圧縮ではなくバランスのとれた張力による安定性というテンセグリティの原理は、センタリングの基盤にある構造的メタファーである
- `integrate-gestalt` — ゲシュタルト統合における tension-resonance マッピングは圧縮・張力二重性を反映する; 両者とも対立する力の生産的な相互作用を通じて一貫性を見出す
- `analyze-magnetic-levitation` — 同じ厳密性パターン（特性化、分類、安定性検証）を共有する姉妹解析スキル; レビテーションは非接触の力のバランスを達成し、テンセグリティは張力連続性を通じた接触ベースの力のバランスを達成する
- `construct-geometric-figure` — テンセグリティノード位置の幾何学的構築; 幾何学的図形がテンセグリティ解析で安定性を検証する初期トポロジーを提供する
