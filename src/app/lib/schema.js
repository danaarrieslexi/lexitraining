import { timestamp, text, pgTable, serial, varchar, integer} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const LinksTable = pgTable("links", {
    id: serial('id').primaryKey().notNull(),
    url: text("url").notNull(), 
    short: varchar("short", {length: 50}),
    createdAt: timestamp("created_at").defaultNow()
})

export const VisitsTable = pgTable("visits", {
    id: serial('id').primaryKey().notNull(),
    linkId: integer('link_id').notNull().references(()=>LinksTable.id),
    createdAt: timestamp("created_at").defaultNow()
})

//links --> link -> has many vists
export const LinksTableRelations = relations(LinksTable, ({many}) => ({
    visits: many(VisitsTable)
}))

//visits --> visit -> one link 
export const VisitsTableRelations = relations(VisitsTable, ({many, one}) => ({
    link: one(LinksTable, {
        fields: [VisitsTable.linkId],
        references: [LinksTable.id]
    })
}))