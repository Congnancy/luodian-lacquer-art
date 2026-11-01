import { useEffect, useState } from "react";
import { appUrl, publicAsset } from "../paths";

interface HomeProps {
  selectionSummary: string;
  hasSelection: boolean;
  canEnterWorkshop: boolean;
  finishedUnlocked: boolean;
  onStart: () => void;
  onConfirm: () => void;
  onEnterWorkshop: () => void;
  onOpenFinished: () => void;
}

const sections = [
  { id: "overview", number: "01", label: "调研概述" },
  { id: "history", number: "02", label: "漆器介绍" },
  { id: "materials", number: "03", label: "材质特点" },
  { id: "craftsmanship", number: "04", label: "工艺制作流程" },
  { id: "future", number: "05", label: "现状与发展" },
];

const process = [
  ["01", "制胎", "择木、竹、麻布等为胎骨，塑造器物的形体与尺度。"],
  ["02", "刮灰", "以漆灰逐层填平胎体表面，为后续髹涂打下平整基础。"],
  ["03", "髹漆", "薄涂多遍，层层阴干，让漆膜逐渐形成温润的深色底韵。"],
  ["04", "研磨", "从粗到细反复研磨，使漆面平整，并显出柔和光泽。"],
  ["05", "装饰", "描金、戗金、螺钿等技法为器物添入纹样与色彩。"],
  ["06", "成器", "揩清、推光并静置养护，最终完成一件漆器。"],
];

const materialNotes = [
  { id: "01", en: "SOURCE", title: "天然生漆", text: "漆液取自漆树，经过滤与精制后成为传统髹饰材料。" },
  { id: "02", en: "PROPERTY", title: "坚韧耐久", text: "漆膜致密，具有良好的耐水性与保护性能，适合长期使用。" },
  { id: "03", en: "TEXTURE", title: "温润含蓄", text: "漆色深沉、光泽内敛，在多层髹涂与推光中呈现丰富质感。" },
  { id: "04", en: "CONDITION", title: "顺时而作", text: "漆膜干燥受温度与湿度影响，工序需要耐心与稳定的环境。" },
];

interface DialogContent {
  title: string;
  eyebrow: string;
  paragraphs: string[];
}

const dialogs: Record<string, DialogContent> = {
  culture: {
    eyebrow: "FIELD NOTE · 01",
    title: "漆器与日常生活",
    paragraphs: [
      "漆器兼具实用与陈设价值，常见于食器、礼器与日常收纳。器形、髹饰与纹样共同记录着不同时代的审美选择。",
      "本次调研以漆盘为观察对象，从材料、造型与工艺三个角度认识传统漆艺。",
    ],
  },
  industry: {
    eyebrow: "FIELD NOTE · 02",
    title: "技艺传承与当代表达",
    paragraphs: [
      "传统漆艺学习周期长、手工环节多，公众往往只能通过展览、图录或短片接触制作过程。",
      "数字展示可把工序拆解成可观看、可尝试的体验，让器物背后的材料知识与匠作方法更容易被理解。",
    ],
  },
  journey: {
    eyebrow: "USER RESEARCH · JOURNEY",
    title: "从好奇到亲手体验",
    paragraphs: [
      "初次接触者通常先被漆器的光泽与纹样吸引，随后想了解它由什么制成、如何装饰。",
      "清晰的工序说明、可逐步操作的模拟体验与即时反馈，有助于降低理解门槛。",
    ],
  },
  survey: {
    eyebrow: "USER RESEARCH · SUMMARY",
    title: "用户调研关注点",
    paragraphs: [
      "调研围绕三个问题展开：是否听说过漆器，能否辨认主要制作步骤，以及是否愿意尝试交互式的制作体验。",
      "展示信息以帮助初学者快速理解为先，并通过操作引导进一步认识漆器工艺。",
    ],
  },
};

export function Home({
  selectionSummary,
  hasSelection,
  canEnterWorkshop,
  finishedUnlocked,
  onStart,
  onConfirm,
  onEnterWorkshop,
  onOpenFinished,
}: HomeProps) {
  const [dialog, setDialog] = useState<DialogContent | null>(null);

  useEffect(() => {
    if (!dialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialog(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog]);

  return (
    <main className="research-site">
      <header className="research-topbar">
        <a className="research-brand" href={appUrl("/")} aria-label="非遗漆器工艺首页">
          <span className="research-seal">漆</span>
          <span><strong>非遗漆器工艺</strong><small>传统技艺 · 小组调研展示</small></span>
        </a>
        <nav className="research-nav" aria-label="章节导航">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              <span>{section.number}</span>{section.label}
            </a>
          ))}
        </nav>
        <a className="research-nav-cta" href="#begin">开启体验 <span aria-hidden="true">↗</span></a>
      </header>

      <section className="research-hero">
        <div className="research-hero-copy">
          <p className="research-eyebrow"><span /> 非物质文化遗产 · 传统技艺调研</p>
          <h1>以漆为墨，<br /><em>以器载道。</em></h1>
          <p className="research-hero-lead">
            走近漆器的材料、形制与制作过程，读懂一道道手工工序如何沉淀为器物上的光。
          </p>
          <a href="#overview" className="research-scroll-link">向下了解 <span aria-hidden="true">↓</span></a>
        </div>
        <div className="research-hero-art" aria-label="黑漆嵌螺钿花鸟纹八方盘">
          <span className="research-orbit research-orbit--one" />
          <span className="research-orbit research-orbit--two" />
          <span className="research-art-note research-art-note--top">LACQUERWARE · HERITAGE CRAFT</span>
          <img src={publicAsset("/craft-images/步骤3状态0.png")} alt="黑漆嵌螺钿花鸟纹八方盘" />
          <span className="research-art-note research-art-note--bottom">传统髹饰 · 螺钿花鸟纹</span>
          <span className="research-art-index">01 <i>/</i> 05</span>
        </div>
        <div className="research-hero-index"><span>漆</span><i>CRAFT & CULTURE</i></div>
      </section>

      <nav className="research-chapter-rail" aria-label="页面章节">
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            <span>{section.number}</span><b>{section.label}</b>
          </a>
        ))}
      </nav>

      <section className="research-section research-overview" id="overview">
        <div className="research-section-head">
          <p className="research-eyebrow"><span /> 01 <i>OVERVIEW</i></p>
          <h2>调研概述</h2>
          <p>从文化背景、公众认知与体验需求出发，认识漆艺数字传播的意义。</p>
        </div>
        <div className="overview-grid">
          <article className="overview-lead">
            <span className="research-index">BACKGROUND · 01</span>
            <h3>一件漆器，<br />承载的不只是器用。</h3>
            <p>漆器以天然漆料和手工髹饰为基础，兼具实用功能与装饰美感。漆盘的造型、漆色与纹样，构成了理解传统生活美学的一扇窗口。</p>
            <button className="inline-research-link" type="button" onClick={() => setDialog(dialogs.culture)}>
              文化与工艺背景 <span aria-hidden="true">↗</span>
            </button>
          </article>
          <article className="overview-fact">
            <span className="research-index">THE CHALLENGE · 02</span>
            <h3>看得到器物，<br />却不一定看得懂工序。</h3>
            <p>漆艺制作周期长、工序细密。静态图文难以呈现反复髹涂、研磨与镶嵌的过程，初学者也较难建立完整认识。</p>
            <button className="inline-research-link" type="button" onClick={() => setDialog(dialogs.industry)}>
              行业与传承观察 <span aria-hidden="true">↗</span>
            </button>
          </article>
          <article className="overview-fact overview-fact--accent">
            <span className="research-index">USER NEED · 03</span>
            <h3>让知识可读，<br />让工艺可以亲手试一试。</h3>
            <p>面向年轻学生与非遗兴趣人群，用简明介绍搭配可操作的工序模拟，帮助用户从观看走向理解。</p>
            <div className="overview-actions">
              <button className="inline-research-link" type="button" onClick={() => setDialog(dialogs.journey)}>
                查看用户旅程 <span aria-hidden="true">↗</span>
              </button>
              <button className="inline-research-link" type="button" onClick={() => setDialog(dialogs.survey)}>
                调研关注点 <span aria-hidden="true">↗</span>
              </button>
            </div>
          </article>
        </div>
        <div className="overview-ribbon"><span>研究缘起</span><i /> <span>用户需求</span><i /> <span>数字体验</span><b>从认知到参与</b></div>
      </section>

      <section className="research-section research-history" id="history">
        <div className="research-section-head">
          <p className="research-eyebrow"><span /> 02 <i>HISTORY</i></p>
          <h2>漆器介绍</h2>
          <p>漆艺随时代发展，在生活器用与审美表达之间不断演变。</p>
        </div>
        <div className="history-feature">
          <div className="history-plate">
            <video
              className="history-plate-video"
              src={publicAsset("/artifact-images/home-lacquer-intro.mp4")}
              poster={publicAsset("/craft-images/步骤3状态0.png")}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="漆器介绍视频"
            />
            <span>器物纹样 · 局部意象</span>
          </div>
          <div className="history-copy">
            <span className="research-index">HISTORY · OBJECT · CRAFT</span>
            <h3>从日常器用，<br /><em>到可赏可传的手工之美。</em></h3>
            <p>漆器以木、竹等材料为胎，反复施漆并经研磨、装饰而成。不同的器形与纹饰映照着当时的生活方式，也体现了材料与手艺的长期磨合。</p>
            <p>螺钿以贝片嵌饰漆面，光线转动时呈现细腻的虹彩。花鸟纹样与八方轮廓相映，让器物在沉静漆色中显出灵动层次。</p>
            <div className="history-caption"><span>形制</span><span>髹饰</span><span>纹样</span><span>光泽</span></div>
          </div>
        </div>
      </section>

      <section className="research-section research-materials" id="materials">
        <div className="research-section-head research-section-head--split">
          <div>
            <p className="research-eyebrow"><span /> 03 <i>MATERIAL</i></p>
            <h2>材质特点</h2>
          </div>
          <p>天然材料的属性，决定了漆器的触感、光泽与制作节奏。</p>
        </div>
        <div className="material-grid">
          {materialNotes.map((item) => (
            <article className="material-item" key={item.id}>
              <span className="material-number">{item.id}</span>
              <span className="material-en">{item.en}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="material-rule" />
            </article>
          ))}
        </div>
        <div className="material-facts">
          <div><span>成膜方式</span><strong>自然干燥</strong></div>
          <div><span>主要原料</span><strong>天然生漆</strong></div>
          <div><span>表面处理</span><strong>多层髹涂 · 反复研磨</strong></div>
          <div><span>工艺特点</span><strong>细工慢作</strong></div>
        </div>
      </section>

      <section className="research-section research-craft" id="craftsmanship">
        <div className="research-section-head">
          <p className="research-eyebrow"><span /> 04 <i>CRAFTSMANSHIP</i></p>
          <h2>工艺制作流程</h2>
          <p>由胎体到成器，漆艺依靠多次施作、等待与细致修整逐步完成。</p>
        </div>
        <div className="craft-timeline">
          {process.map(([number, title, text]) => (
            <article className="craft-process-item" key={number}>
              <span className="craft-process-number">{number}</span>
              <span className="craft-process-line" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="craft-note"><span>工艺札记</span><p>不同器物与装饰方法的具体工序有所差异；完整作品往往需要多轮髹饰和细磨，时间与经验共同塑造漆面的深度。</p></div>
      </section>

      <section className="research-section research-future" id="future">
        <div className="research-section-head">
          <p className="research-eyebrow"><span /> 05 <i>PRESENT & FUTURE</i></p>
          <h2>现状与发展</h2>
          <p>传承、生产与传播共同影响传统漆艺如何走进当代生活。</p>
        </div>
        <div className="future-grid">
          <article><span>传承</span><strong>持续学习</strong><p>师徒经验与长期训练仍是掌握细致髹饰技艺的重要路径。</p></article>
          <article><span>生产</span><strong>手工协作</strong><p>材料、环境与工序配合紧密，制作过程需要稳定投入。</p></article>
          <article><span>传播</span><strong>多元表达</strong><p>展览、教育与数字媒介为公众提供更多认识漆器的入口。</p></article>
        </div>
        <div className="discussion">
          <span className="research-index">OBSERVATION & DISCUSSION</span>
          <h3>传统手艺如何与今天相遇？</h3>
          <p className="workflow-summary">从择器到成器，沿着交互流程亲手体验一件漆器的诞生。</p>
          <div className="workflow-chart" aria-label="漆艺网站交互流程图">
            <div className="workflow-spine">
              <span className="workflow-node workflow-node--start">开始</span>
              <span className="workflow-arrow" aria-hidden="true">↓</span>
              <button className="workflow-node" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                进入漆艺造物主页
              </button>
              <span className="workflow-arrow" aria-hidden="true">↓</span>
              <button className="workflow-node workflow-node--action" type="button" onClick={onStart}>
                点击「开始选择」
              </button>
              <span className="workflow-arrow" aria-hidden="true">↓</span>
              <button className="workflow-node workflow-node--action" type="button" onClick={onStart}>
                选择历史文物与器型
              </button>
              <span className="workflow-arrow" aria-hidden="true">↓</span>
              <button className="workflow-node workflow-node--action" type="button" onClick={onStart}>
                选择漆色
              </button>
              <span className="workflow-arrow" aria-hidden="true">↓</span>
              <div className={`workflow-decision${hasSelection ? " is-complete" : ""}`} role="status" aria-live="polite">
                <span className="workflow-diamond"><span>是否已完成选择？</span></span>
                <span className="workflow-decision-state">{hasSelection ? `当前选择：${selectionSummary}` : "尚未选择器型与漆色"}</span>
              </div>
              <div className="workflow-branches">
                <div className={`workflow-branch workflow-branch--no${!hasSelection ? " is-active" : ""}`}>
                  <span className="workflow-branch-label">否</span>
                  <span className="workflow-arrow" aria-hidden="true">↓</span>
                  <button className="workflow-node workflow-node--subtle" type="button" onClick={onStart}>
                    提示完成选择
                  </button>
                  <span className="workflow-arrow" aria-hidden="true">↓</span>
                  <button className="workflow-node workflow-node--subtle" type="button" onClick={onStart}>
                    返回选择步骤
                  </button>
                </div>
                <div className={`workflow-branch workflow-branch--yes${hasSelection ? " is-active" : ""}`}>
                  <span className="workflow-branch-label">是</span>
                  <span className="workflow-arrow" aria-hidden="true">↓</span>
                  <button className="workflow-node workflow-node--action" type="button" onClick={onConfirm}>
                    点击「确认器型」
                  </button>
                  <span className="workflow-arrow" aria-hidden="true">↓</span>
                  <button
                    className={`workflow-node${canEnterWorkshop ? " workflow-node--action" : " workflow-node--locked"}`}
                    type="button"
                    onClick={onEnterWorkshop}
                    aria-label={canEnterWorkshop ? "进入七步漆艺制作" : "进入制作前请先完成有效器型与漆色选择"}
                  >
                    进入七步漆艺制作
                  </button>
                  <span className="workflow-arrow" aria-hidden="true">↓</span>
                  <button className={`workflow-node${canEnterWorkshop ? " workflow-node--action" : " workflow-node--locked"}`} type="button" onClick={onEnterWorkshop}>
                    依次完成七道工序
                  </button>
                  <span className="workflow-arrow" aria-hidden="true">↓</span>
                  <button
                    className={`workflow-node${finishedUnlocked ? " workflow-node--action" : " workflow-node--locked"}`}
                    type="button"
                    onClick={onOpenFinished}
                    aria-label={finishedUnlocked ? "进入成品展示" : "完成第七道工序后进入成品展示"}
                  >
                    进入成品展示
                  </button>
                  <span className="workflow-arrow" aria-hidden="true">↓</span>
                  <span className="workflow-node workflow-node--end">结束</span>
                </div>
              </div>
              <p className="workflow-footnote">
                {hasSelection
                  ? canEnterWorkshop
                    ? "器型与漆色已选，可确认进入制作。"
                    : "选择已完成，但当前器型或漆色尚无对应工序素材。"
                  : "点击任一择器节点即可前往选择页面。"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="research-invitation" id="begin">
        <div className="invitation-ornament" aria-hidden="true">漆</div>
        <p className="research-eyebrow"><span /> FROM KNOWLEDGE TO EXPERIENCE</p>
        <h2>开启你的漆艺创作</h2>
        <p>从历史文物中汲取灵感，选择器型与漆色，亲手体验传统漆艺的制作过程。</p>
        <button type="button" className="research-start-button" onClick={onStart}>
          开始选择 <span aria-hidden="true">→</span>
        </button>
      </section>

      <footer className="research-footer">
        <div className="research-footer-brand"><span className="research-seal">漆</span><span>非遗漆器工艺</span></div>
        <div className="research-footer-links">
          {sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}
        </div>
        <p>传统技艺 · 数字体验</p>
      </footer>

      {dialog && (
        <div className="research-dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDialog(null);
        }}>
          <section className="research-dialog" role="dialog" aria-modal="true" aria-labelledby="research-dialog-title">
            <button className="research-dialog-close" type="button" aria-label="关闭" onClick={() => setDialog(null)}>×</button>
            <p className="research-eyebrow"><span /> {dialog.eyebrow}</p>
            <h2 id="research-dialog-title">{dialog.title}</h2>
            {dialog.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <button className="inline-research-link" type="button" onClick={() => setDialog(null)}>返回章节 <span aria-hidden="true">↗</span></button>
          </section>
        </div>
      )}
    </main>
  );
}
