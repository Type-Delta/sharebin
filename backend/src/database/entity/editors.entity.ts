import { Entity, ObjectIdColumn, Column, ObjectId } from "typeorm"

@Entity("editors", { name: "editors" })
export class EditorsENT {
   @ObjectIdColumn()
   _id!: ObjectId

   @Column({ type: "string", unique: true })
   id!: string

   @Column({ type: "string" })
   ownerId!: string

   @Column({ type: "string" })
   content!: string

   @Column({ type: "number", default: -1 })
   contentVersion!: number

   @Column({ type: "date", default: () => "CURRENT_TIMESTAMP" })
   lastModified!: Date

   @Column({ type: "array", default: [] })
   connections!: string[];
}
