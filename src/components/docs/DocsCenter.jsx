import React, { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function DocsCenter() {
  // Load all markdown files at build-time as raw strings
  const files = useMemo(() => {
    // Vite import.globs - eager raw content
    const modules = {
      ...import.meta.glob("/src/components/**/*.md", { as: "raw", eager: true }),
      ...import.meta.glob("/src/components/docs/*.md", { as: "raw", eager: true })
    };
    const docs = Object.entries(modules).map(([path, content]) => {
      const parts = path.split("/");
      const fileName = parts[parts.length - 1];
      const group = parts.slice(3, parts.length - 1).join("/"); // after /src
      return { path, fileName, group, title: fileName.replace(/\.md$/i, ""), content };
    });
    // Sort by group then title
    return docs.sort((a, b) => (a.group || "").localeCompare(b.group || "") || a.title.localeCompare(b.title));
  }, []);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(files[0]?.path || "");

  const filtered = files.filter(f =>
    f.title.toLowerCase().includes(query.toLowerCase()) ||
    f.group.toLowerCase().includes(query.toLowerCase())
  );

  const current = filtered.find(f => f.path === selected) || filtered[0] || files[0];

  return (
    <div className="w-full h-full grid lg:grid-cols-3 gap-6">
      <Card className="border-0 shadow-md lg:col-span-1 h-full">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Documentos (Markdown)</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <Input
            placeholder="Buscar por título ou pasta..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Select
            value={current?.path || ""}
            onValueChange={(v) => setSelected(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um documento" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {filtered.map((doc) => (
                <SelectItem key={doc.path} value={doc.path}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{doc.group || "docs"}</Badge>
                    <span className="truncate">{doc.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="text-xs text-slate-500">
            {filtered.length} documento(s) • {new Set(filtered.map(f => f.group)).size} pasta(s)
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md lg:col-span-2 h-full">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <span className="truncate">{current?.title || "Selecione um documento"}</span>
            {current?.group && <Badge variant="outline">{current.group}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 overflow-auto max-h-[70vh]">
          {current ? (
            <ReactMarkdown className="prose max-w-none">
              {current.content}
            </ReactMarkdown>
          ) : (
            <div className="text-slate-500">Nenhum documento encontrado.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}