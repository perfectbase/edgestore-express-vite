import { useEffect, useState } from "react";
import { EdgeStoreProvider, useEdgeStore } from "./lib/edgestore";
import { EdgeStoreApiClientError } from "@edgestore/react/shared";

function App() {
  return (
    <EdgeStoreProvider
      basePath={`${import.meta.env.VITE_API_ENDPOINT}/edgestore`}
    >
      <div>
        <UploadInput />
        <ServerUploadInput />
        <FileList />
      </div>
    </EdgeStoreProvider>
  );
}

export default App;

function UploadInput() {
  const [file, setFile] = useState<File | null>(null);
  const { edgestore } = useEdgeStore();

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          setFile(e.target.files?.[0] ?? null);
        }}
      />
      <button
        onClick={async () => {
          if (file) {
            try {
              const res = await edgestore.publicFiles.upload({
                file,
                onProgressChange: (progress) => {
                  // you can use this to show a progress bar
                  console.log(progress);
                },
              });
              // you can run some server action or api here
              // to add the necessary data to your database
              console.log(res);
            } catch (error) {
              console.log(error);
              if (error instanceof EdgeStoreApiClientError) {
                if (error.data.code === "MIME_TYPE_NOT_ALLOWED") {
                  alert(
                    `File type not allowed. Allowed types are ${error.data.details.allowedMimeTypes.join(
                      ", "
                    )}`
                  );
                }
              }
            }
          }
        }}
      >
        Upload
      </button>
    </div>
  );
}

function ServerUploadInput() {
  return (
    <div>
      <button
        onClick={async () => {
          await fetch(`${import.meta.env.VITE_API_ENDPOINT}/server-upload`, {
            method: "POST",
            body: JSON.stringify({
              text: "hello world",
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
        }}
      >
        Server Upload
      </button>
    </div>
  );
}

function FileList() {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_ENDPOINT}/list-files`
      );
      const json = await res.json();
      setFiles(json);
    })();
  }, []);

  return (
    <div>
      <h2>Files</h2>
      <ul>
        {files.map((url) => (
          <li key={url}>
            <div style={{ display: "flex", gap: "4px" }}>
              <a href={url}>{url.split("/").pop()}</a>
              <button
                onClick={async () => {
                  await fetch(
                    `${import.meta.env.VITE_API_ENDPOINT}/delete-file`,
                    {
                      method: "POST",
                      body: JSON.stringify({
                        url,
                      }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  setFiles(files.filter((f) => f !== url));
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
