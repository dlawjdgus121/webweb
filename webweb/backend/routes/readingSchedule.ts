// backend/routes/readingSchedule.ts
import express from 'express';
import { Client } from '@notionhq/client';
import { findBookPageIdByTitle } from '../../core/notion/notionUtils.ts';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const calendarDatabaseId = process.env.NOTION_CALENDAR_DATABASE_ID!; // 캘린더 DB 아이디

interface ReadingScheduleRequest {
  title: string;       // 책 제목
  start_date: string;  // YYYY-MM-DD
  end_date: string;    // YYYY-MM-DD
  total_pages: number; // 총 페이지 수
  author?: string;     // 저자 (선택)
}

router.post('/reading-schedule', async (req, res) => {
  const { title, start_date, end_date, total_pages, author } = req.body as ReadingScheduleRequest;

  if (!title || !start_date || !end_date || !total_pages) {
    return res.status(400).json({ error: '필수 항목 누락' });
  }

  try {
    // 날짜 차이 계산 (일수)
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (diffDays <= 0) {
      return res.status(400).json({ error: '종료일은 시작일 이후여야 합니다.' });
    }

    const bookPageId = await findBookPageIdByTitle(title);

    // 하루 읽기 페이지 수 계산 (올림)
    const pagesPerDay = Math.ceil(total_pages / diffDays);

    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(startDate.getTime() + i * 86400000);
      const formattedDate = currentDate.toISOString().split('T')[0];

      const startPage = i * pagesPerDay + 1;
      let endPage = (i + 1) * pagesPerDay;
      if (endPage > total_pages) endPage = total_pages;

const pageTitle = `${i + 1}일차`;  // 책 이름 + 읽은 날짜 (몇일차)

      const content = `${startPage}~${endPage}쪽`;

      await notion.pages.create({
        parent: { database_id: calendarDatabaseId },
        properties: {
          책: {                          // 제목: 책
            title: [
              { text: { content: pageTitle } }
            ]
          },
          내용: {                        // 내용: 텍스트
            rich_text: [
              { text: { content } }
            ]
          },
          "완독 목표 날짜": {             // 완독 목표 날짜: 날짜
            date: { start: end_date }
          },
          저자: author ? {              // 저자: 텍스트
            rich_text: [
              { text: { content: author } }
            ]
          } : {
            rich_text: []
          },
          "처음 읽은 날": {              // 처음읽은날: 날짜
            date: { start: start_date }
          },
          "총페이지": {                 // 총페이지: 숫자
            number: total_pages
          },
          "책장": bookPageId ? {
            relation: [{ id: bookPageId }]
          } : {
            relation: []
          }

        }
      });
    }

    return res.json({ message: '읽기 일정이 성공적으로 생성되었습니다.' });
  } catch (error) {
    console.error('읽기 일정 생성 오류:', error);
    return res.status(500).json({ error: '읽기 일정 생성에 실패했습니다.' });
  }
});

export default router;
