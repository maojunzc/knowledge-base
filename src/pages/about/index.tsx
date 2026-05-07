import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Descriptions, Spin, message, Button, Tooltip, Tag, Space, Modal } from "antd";
import { SettingOutlined, SyncOutlined, BookOutlined } from "@ant-design/icons";
import { FolderOpen, ZoomIn } from "lucide-react";
import { openPath } from "@tauri-apps/plugin-opener";
import type { SystemInfo } from "@/types";
import { systemApi } from "@/lib/api";

// 每日一言数据结构
interface DailyQuote {
  content: string;
  author: string;
}

const QQ_NUMBER = "2316562571";

const { Title, Text } = Typography;

/**
 * 关于页左侧锚点导航。
 * 行为与 settings 页 SettingsAnchorNav 一致：点击 smooth 滚动 + IntersectionObserver 同步高亮。
 */
const ABOUT_NAV_ITEMS: { id: string; label: string }[] = [
  { id: "about-system", label: "系统信息" },
  { id: "about-daily-quote", label: "每日一言" },
  { id: "about-wechat", label: "添加微信" },
  { id: "about-migration", label: "数据迁移说明" },
];

function AboutAnchorNav() {
  const [activeId, setActiveId] = useState<string>(ABOUT_NAV_ITEMS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "0px 0px -66% 0px", threshold: 0 },
    );
    ABOUT_NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <aside className="anchor-page-nav">
      <ul>
        {ABOUT_NAV_ITEMS.map((item) => (
          <li
            key={item.id}
            data-active={activeId === item.id || undefined}
            onClick={() => jumpTo(item.id)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function AboutPage() {
  const navigate = useNavigate();
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);

  // 获取每日一言
  const fetchDailyQuote = async () => {
    setQuoteLoading(true);
    try {
      // 定义文学类 API，支持重试机制
      const apis = [
        // 1. 一言 API
        async () => {
          const res = await fetch("https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=e&c=f&c=g&c=h&i=1");
          if (!res.ok) throw new Error("一言API请求失败");
          const data = await res.json();
          return {
            content: data.hitokoto || "",
            author: data.creator || "未知",
          };
        },
        // 2. 古诗词 API
        async () => {
          const res = await fetch("https://api.xygeng.cn/ShuJin");
          if (!res.ok) throw new Error("古诗词API请求失败");
          const data = await res.json();
          if (data.code === 200 && data.data?.content) {
            return {
              content: data.data.content,
              author: data.data.author || "佚名",
            };
          }
          throw new Error("诗词API数据格式错误");
        },
        // 3. 网易云热评
        async () => {
          const res = await fetch("https://api.uomg.com/api/rand.yingsu?format=json");
          if (!res.ok) throw new Error("网易云API请求失败");
          const data = await res.json();
          if (data.code === 1 && data.data?.content) {
            return {
              content: data.data.content,
              author: data.data.author || "网易云用户",
            };
          }
          throw new Error("网易云API数据格式错误");
        },
      ];

      // 打乱 API 顺序，然后依次尝试直到成功
      const shuffledApis = [...apis].sort(() => Math.random() - 0.5);
      let lastError: Error | null = null;

      for (const api of shuffledApis) {
        try {
          const quoteData = await api();
          if (quoteData.content) {
            setQuote(quoteData);
            return;
          }
        } catch (e) {
          lastError = e instanceof Error ? e : new Error(String(e));
          continue;
        }
      }
      
      // 所有 API 都失败，抛出最后一个错误
      throw lastError || new Error("所有API均不可用");
    } catch (error) {
      console.error("获取每日一言失败:", error);
      // 如果全部失败，使用默认内容
      setQuote({
        content: "星光不问赶路人，时光不负有心人。",
        author: "佚名",
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  useEffect(() => {
    systemApi
      .getSystemInfo()
      .then(setInfo)
      .catch((e) => message.error(String(e)))
      .finally(() => setLoading(false));

    // 初始加载一言
    fetchDailyQuote();
  }, []);

  async function handleOpenDataDir() {
    if (!info?.dataDir) return;
    try {
      await openPath(info.dataDir);
    } catch (e) {
      message.error(`打开目录失败: ${e}`);
    }
  }

  return (
    <div className="anchor-page-layout">
      <AboutAnchorNav />
      <div className="anchor-page-content" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>关于</Title>
          <Text type="secondary">系统信息和应用版本</Text>
        </div>
        <Button
          icon={<SettingOutlined />}
          onClick={() => navigate("/settings")}
        >
          前往设置
        </Button>
      </div>

      <Card id="about-system" title="系统信息">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spin />
          </div>
        ) : info ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="操作系统">{info.os}</Descriptions.Item>
            <Descriptions.Item label="CPU 架构">{info.arch}</Descriptions.Item>
            <Descriptions.Item label="应用版本">
              <Text style={{ fontSize: 13 }}>v{info.appVersion}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="数据目录">
              <div className="flex items-center justify-between gap-2">
                <Text copyable={{ text: info.dataDir }} style={{ fontSize: 13 }}>
                  {info.dataDir}
                </Text>
                <Tooltip title="在文件管理器中打开">
                  <Button
                    type="link"
                    size="small"
                    icon={<FolderOpen size={14} />}
                    onClick={handleOpenDataDir}
                  />
                </Tooltip>
              </div>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Text type="danger">无法获取系统信息</Text>
        )}
      </Card>

      {/* 每日一言 */}
      <Card
        id="about-daily-quote"
        title={
          <Space>
            <BookOutlined />
            <span>每日一言</span>
          </Space>
        }
        extra={
          <Button
            type="text"
            icon={<SyncOutlined spin={quoteLoading} />}
            onClick={fetchDailyQuote}
            loading={quoteLoading}
            size="small"
          >
            换一句
          </Button>
        }
      >
        {quoteLoading && !quote ? (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        ) : quote ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Typography.Paragraph
              style={{
                fontSize: 20,
                lineHeight: 1.8,
                fontWeight: 500,
                fontStyle: "italic",
              }}
            >
              「 {quote.content} 」
            </Typography.Paragraph>
          </div>
        ) : null}
      </Card>

      {/* 微信添加好友 */}
      <Card
        id="about-wechat"
        title={
          <Space>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#07C160">
              <path d="M8.5 11.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 2C6.48 2 2 6.03 2 11c0 2.76 1.36 5.22 3.5 6.83V22l4.07-2.24c.79.22 1.62.35 2.43.35 5.52 0 10-4.03 10-9s-4.48-9-10-9z"/>
            </svg>
            <span>添加微信好友</span>
          </Space>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* 微信二维码 */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                background: "linear-gradient(135deg, #07C160 0%, #10B981 100%)",
                borderRadius: 12,
                padding: 4,
                boxShadow: "0 4px 16px rgba(7, 193, 96, 0.2)",
              }}
            >
              <div style={{ background: "#fff", borderRadius: 10, padding: 10 }}>
                <img
                  src="/VX.jpg"
                  alt="微信二维码"
                  style={{ width: 140, height: 140, objectFit: "contain", display: "block" }}
                />
              </div>
            </div>
            {/* 放大按钮 */}
            <Tooltip title="点击放大查看">
              <Button
                type="primary"
                shape="circle"
                size="small"
                icon={<ZoomIn size={16} />}
                onClick={() => setQrCodeModalOpen(true)}
                style={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  background: "rgba(7, 193, 96, 0.9)",
                  border: "none",
                }}
              />
            </Tooltip>
          </div>

          {/* 提示文字 */}
          <Text type="secondary" style={{ fontSize: 12 }}>
            点击放大按钮可查看大图，方便扫码
          </Text>

          {/* QQ */}
          <Tag
            color="blue"
            style={{ padding: "8px 16px", fontSize: 14, cursor: "pointer" }}
            onClick={() => {
              navigator.clipboard.writeText(QQ_NUMBER);
              message.success("QQ号已复制");
            }}
          >
            QQ: {QQ_NUMBER}
          </Tag>
        </div>
      </Card>

      {/* 二维码放大查看弹窗 */}
      <Modal
        open={qrCodeModalOpen}
        onCancel={() => setQrCodeModalOpen(false)}
        footer={null}
        centered
        width={320}
        title="微信二维码 - 扫码添加好友"
        styles={{
          body: { padding: 24, display: "flex", justifyContent: "center" },
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #07C160 0%, #10B981 100%)",
            borderRadius: 16,
            padding: 8,
            boxShadow: "0 8px 32px rgba(7, 193, 96, 0.3)",
          }}
        >
          <div style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
            <img
              src="/VX.jpg"
              alt="微信二维码"
              style={{ width: 240, height: 240, objectFit: "contain", display: "block" }}
            />
          </div>
        </div>
      </Modal>

      {info && (
        <Card
          id="about-migration"
          title="数据迁移说明"
          size="small"
        >
          <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 10 }}>
            按使用场景从简单到专业，推荐 4 种方式：
          </Typography.Paragraph>

          <Typography.Title level={5} style={{ fontSize: 13, marginBottom: 4, marginTop: 0 }}>
            ① 单台电脑换硬盘 / 搬到 D 盘
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: 13, marginBottom: 12 }}>
            <Text strong>设置 → 数据目录</Text> 选新路径，勾选「
            <Text type="success">自动迁移</Text>
            」即可。应用会启动迁移引导窗口完成搬运，无需手工复制文件。
          </Typography.Paragraph>

          <Typography.Title level={5} style={{ fontSize: 13, marginBottom: 4, marginTop: 0 }}>
            ② 一次性整包搬到另一台电脑（离线）
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: 13, marginBottom: 12 }}>
            旧电脑：<Text strong>设置 → 同步 → 本地 ZIP → 导出</Text>{" "}
            得到一个 .zip 快照（含全部数据库 + 图片 + PDF + 附件 + 源文件）。
            新电脑安装应用后到同位置选择 <Text strong>导入 ZIP</Text>，自动解压覆盖。
          </Typography.Paragraph>

          <Typography.Title level={5} style={{ fontSize: 13, marginBottom: 4, marginTop: 0 }}>
            ③ 多端实时双向同步（推荐长期用户）
          </Typography.Title>
          <Typography.Paragraph style={{ fontSize: 13, marginBottom: 12 }}>
            <Text strong>设置 → 同步 → 多端同步（V1）</Text>{" "}
            配置 WebDAV / 坚果云 / NAS 后端；多台电脑都登录同一个账号，应用会按文件级
            manifest 增量推拉，自动消化双端冲突。也可以只用「
            <Text>WebDAV 全量快照</Text>」做单向手动备份。
          </Typography.Paragraph>

          <Typography.Title level={5} style={{ fontSize: 13, marginBottom: 4, marginTop: 0 }}>
            ④ 手动复制（兜底方案，应急用）
          </Typography.Title>
          <Typography.Paragraph
            type="secondary"
            style={{ fontSize: 12, marginBottom: 6 }}
          >
            数据目录下的核心文件 / 子目录：
          </Typography.Paragraph>
          <ul style={{ fontSize: 12, paddingLeft: 20, margin: "0 0 8px", color: "rgba(0,0,0,0.45)" }}>
            <li style={{ marginBottom: 2 }}><code>app.db</code> — 笔记 / 文件夹 / 标签 / 链接 / AI 对话 / 待办 / 加密数据等全部元数据（SQLite）</li>
            <li style={{ marginBottom: 2 }}><code>kb_assets/</code> — 笔记内嵌图片（含 <code>kb_assets/videos/</code> 子目录的视频）</li>
            <li style={{ marginBottom: 2 }}><code>pdfs/</code> — 导入的 PDF 原始文件</li>
            <li style={{ marginBottom: 2 }}><code>sources/</code> — 导入的 Word（.docx/.doc）原始文件</li>
            <li style={{ marginBottom: 2 }}><code>attachments/</code> — 笔记附件（zip / 音频等通用文件）</li>
            <li><code>settings.json</code> — 应用偏好（主题、窗口状态、字体等）</li>
          </ul>
          <Typography.Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 0 }}>
            步骤：关闭应用 → 整目录复制到新电脑相同路径（点上方「打开数据目录」定位）→
            启动即可。<Text strong>务必整目录一起搬</Text>，单独复制 <code>app.db</code>{" "}
            会丢图片 / PDF / 附件。
          </Typography.Paragraph>

          <Typography.Paragraph
            type="warning"
            style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}
          >
            ⚠ 任何方式都要在迁移前关闭应用；新旧两端版本号差距不要超过一个小版本，避免
            schema 不兼容。需要给其他工具用，可在
            <Text strong> 设置 → 导出 Markdown</Text> 单独导出标准 .md 文件。
          </Typography.Paragraph>
        </Card>
      )}

      </div>
    </div>
  );
}
