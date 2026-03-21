import asyncio
from app.db.session import async_session_factory
from sqlalchemy import select, func
from app.models.event import Event

async def count():
    async with async_session_factory() as session:
        result = await session.execute(select(func.count(Event.id)))
        count = result.scalar()
        print(f"Total events: {count}")
        if count > 0:
            result2 = await session.execute(select(Event).limit(5))
            for event in result2.scalars():
                print(f"Event {event.id}: type={event.event_type}, created_at={event.created_at}")

asyncio.run(count())