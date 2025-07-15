import dataSource from "./dataSource";
import { EditorsENT } from "./entity"



export const repo = {
   editors: dataSource.mongodb.getMongoRepository(EditorsENT)
}

export async function getEditorById(id: string) {
   return repo.editors.findOne({ where: { id } });
}

export async function hasEditor(id: string) {
   const editor = await getEditorById(id);
   return !!editor;
}

export async function createEditor(id: string, options: Partial<EditorsENT> = {}): Promise<string> {
   const editor = repo.editors.create({
      id,
      connections: [],
      content: '',
      contentVersion: 0,
      lastModified: new Date(),
      ownerId: '',
      ...options
   });
   await repo.editors.save(editor);
   return id;
}

export async function saveEditor(editor: EditorsENT): Promise<void> {
   await repo.editors.save(editor);
}

export async function clearAllEditorConnections() {
   const editors = await repo.editors.find();
   editors.forEach(editor => {
      editor.connections = [];
   });
}
