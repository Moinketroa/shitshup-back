NOTIFY tasks_changes;

DROP TRIGGER new_task_trigger ON tasks;

CREATE OR REPLACE FUNCTION notify_new_task()
    RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('tasks_changes', NEW.id::text);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_task_trigger
    AFTER INSERT ON tasks
    FOR EACH ROW
EXECUTE FUNCTION notify_new_task();

DROP TRIGGER updated_task_trigger ON tasks;

CREATE OR REPLACE FUNCTION notify_updated_task()
    RETURNS TRIGGER AS $$
BEGIN
    IF NEW."tasksDone" <> OLD."tasksDone" OR NEW."hasFailed" <> OLD."hasFailed" THEN
        PERFORM pg_notify('tasks_changes', NEW.id::text);
    END IF;

    IF NEW."parentTaskId" IS NOT NULL AND OLD."parentTaskId" IS NULL THEN
        PERFORM pg_notify('tasks_changes', NEW.id::text);
    END IF;


    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER updated_task_trigger
    AFTER UPDATE ON tasks
    FOR EACH ROW
EXECUTE FUNCTION notify_updated_task();
