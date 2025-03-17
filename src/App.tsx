import { useEffect, useRef, useState } from "react";

const App = () => {
  const [htmlFiles, setHtmlFiles] = useState<
    { name: string; content: string }[]
  >([]);
  const [imageMap, setImageMap] = useState<Map<string, string>>(new Map());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [print, setPrint] = useState<boolean>(false);
  const refTime1 = useRef<any>(null);
  const refTime2 = useRef<any>(null);

  useEffect(() => {
    if (fileInputRef.current) {
      (fileInputRef.current as any).webkitdirectory = true;
    }

    return () => {
      clearTimeout(refTime1.current);
      clearTimeout(refTime2.current);
    };
  }, []);

  // Xử lý khi tải lên thư mục
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const newHtmlFiles: { name: string; content: string }[] = [];
    const newImageMap = new Map<string, string>();

    fileArray.forEach(async (file) => {
      const reader = new FileReader();
      if (file.type.startsWith("image/")) {
        // Nếu là hình ảnh, chuyển sang Base64
        reader.readAsDataURL(file);
        reader.onload = () => {
          newImageMap.set(file.name, reader.result as string);
          setImageMap(new Map(newImageMap));
        };
      } else if (file.name.endsWith(".htm")) {
        const arrayBuffer = await file.arrayBuffer();

        // Kiểm tra encoding (Windows-1258 hoặc UTF-8)
        const decoder = new TextDecoder("windows-1258"); // Dùng đúng encoding của file
        let textContent = decoder.decode(arrayBuffer);

        // Chuyển meta charset về UTF-8 để hiển thị đúng
        textContent = textContent.replace(
          /<meta[^>]*charset=[^\s>"]+/i,
          `<meta charset="UTF-8"`
        );

        newHtmlFiles.push({ name: file.name, content: textContent });
        const sortName = newHtmlFiles.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setHtmlFiles(sortName);
      }
    });
  };

  // Thay thế đường dẫn hình ảnh trong HTML bằng Base64
  const replaceImagePaths = (html: string) => {
    imageMap.forEach((base64, filename) => {
      const regex = new RegExp(`${filename}`, "g");
      html = html.replace(regex, `${base64}`);
    });
    return html;
  };

  const handelExport = async () => {
    setPrint(!print);
    refTime1.current = setTimeout(() => {
      const printEndHandler = () => {
        console.log("Hộp thoại in đã đóng.");
        setPrint(false);
        window.removeEventListener("afterprint", printEndHandler);
      };
      window.addEventListener("afterprint", printEndHandler);

      refTime2.current = setTimeout(() => {
        window.print();
      }, 500);
    }, 1000);
  };

  return (
    <div
      className="p-4"
      style={{
        position: "relative",
      }}
    >
      <div
        style={{
          display: print ? "none" : "block",
        }}
      >
        <h1 className="text-xl font-bold mb-4">Chọn thư mục</h1>

        {/* Chọn thư mục HTML + hình ảnh */}
        <input
          ref={fileInputRef}
          type="file"
          accept="*"
          multiple
          onChange={handleFileUpload}
          className="border p-2"
        />

        <button onClick={handelExport}>Print</button>
      </div>

      <div
        className="mt-4"
        style={{
          margin: "0px auto",
        }}
      >
        {htmlFiles.map(({ name, content }, index) => (
          <div
            key={index}
            style={{
              marginTop: "50px",
            }}
          >
            <div
              className="border p-2 mt-2"
              dangerouslySetInnerHTML={{ __html: replaceImagePaths(content) }}
            />
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
        }}
      >
        App created by ThemVo
      </div>
    </div>
  );
};

export default App;
