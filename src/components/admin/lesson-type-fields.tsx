"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function LessonTypeFields() {
  const [type, setType] = useState<"VIDEO" | "TEXT">("VIDEO");

  return (
    <>
      <div>
        <Label>Tipo di lezione</Label>
        <Select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as "VIDEO" | "TEXT")}
        >
          <option value="VIDEO">Video</option>
          <option value="TEXT">Testo</option>
        </Select>
      </div>

      {type === "VIDEO" ? (
        <div>
          <Label>URL video</Label>
          <Input
            name="videoUrl"
            placeholder="Link embed YouTube/Vimeo o file .mp4"
          />
        </div>
      ) : (
        <div>
          <Label>Contenuto testuale</Label>
          <Textarea name="content" rows={4} placeholder="Testo della lezione" />
        </div>
      )}
    </>
  );
}
