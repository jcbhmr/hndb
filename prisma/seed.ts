import { saltAndHashPassword } from "@/lib/password"
import prisma from "@/lib/db"
import * as CSV from "csv/sync"
import assert from "node:assert"
import { readFile } from 'node:fs/promises'

async function main() {
    await prisma.user.upsert({
        where: { username: "test1" },
        update: {},
        create: {
            username: "test1",
            email: "test1@example.com",
            password: saltAndHashPassword("password"),
        }
    });

    const hn_1_csv = await readFile(require.resolve("./hn_1.csv"), "utf-8")
    const data = CSV.parse(hn_1_csv, { columns: true }) as { "Object ID": string, Title: string, "Post Type": string, Author: string, "Created At": string, URL: string, Points: string, "Number of Comments": string }[]
    for (const x of data) {
        const user = await prisma.user.upsert({
            where: { username: x.Author },
            update: {},
            create: {
                username: x.Author,
                email: `${x.Author}@example.com`,
                password: saltAndHashPassword("password"),
                createdAt: new Date(x["Created At"].replace(" ", "T") + "Z"),
            }
        })
        let submission = await prisma.submission.findFirst({
            where: {
                title: x.Title,
                userId: user.id,
            }
        })
        if (submission) {
            continue
        }
        submission = await prisma.submission.create({
            data: {
                title: x.Title,
                url: x.URL,
                createdAt: new Date(x["Created At"].replace(" ", "T") + "Z"),
                userId: user.id,
            }
        })
        const numberOfComments = parseFloat(x["Number of Comments"])
        assert(!Number.isNaN(numberOfComments))
        assert(Number.isInteger(numberOfComments))
        for (let i = 0; i < numberOfComments; i++) {
            await prisma.comment.create({
                data: {
                    submissionId: submission.id,
                    userId: user.id,
                    content: `Comment ${i + 1}`,
                    createdAt: new Date(x["Created At"].replace(" ", "T") + "Z"),
                }
            })
        }
    }
}

main()