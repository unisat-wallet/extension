import { permissionService } from '@/background/service';
import { SessionEvent, SessionEventPayload } from '@/shared/interfaces/SessionEvent';

export interface SessionInfo {
    origin: string;
    icon: string;
    name: string;
}

export class Session {
    public origin = '';
    public icon = '';
    public name = '';

    public key = 0;

    setProp(params: SessionInfo) {
        this.origin = params.origin;
        this.icon = params.icon;
        this.name = params.name;
    }

    pushMessage<T extends SessionEvent>(_ev: T, _data?: SessionEventPayload<T>, _origin?: string) {
        // Method intentionally left blank as it will be assigned in another part.
    }
}

// for each tab
const sessionMap: Map<number, Session> = new Map();

const getSession = (id: number) => {
    return sessionMap.get(id);
};

const getOrCreateSession = (id: number) => {
    return getSession(id) ?? createSession(id);
};

const createSession = (id: number) => {
    const session = new Session();
    sessionMap.set(id, session);

    return session;
};

const deleteSession = (id: number) => {
    sessionMap.delete(id);
};

function broadcastEvent<T extends SessionEvent>(ev: T, data?: SessionEventPayload<T>, origin?: string) {
    let sessions: Session[] = [];
    sessionMap.forEach((session, key) => {
        if (permissionService.hasPermission(session.origin)) {
            sessions.push({
                key,
                ...session
            });
        }
    });

    // same origin
    if (origin) {
        sessions = sessions.filter((session) => session.origin === origin);
    }

    sessions.forEach((session) => {
        try {
            session.pushMessage(ev, data);
        } catch (e) {
            if (sessionMap.has(session.key)) {
                deleteSession(session.key);
            }
        }
    });
}

export default {
    getSession,
    getOrCreateSession,
    deleteSession,
    broadcastEvent
};
