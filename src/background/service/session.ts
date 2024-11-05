import { permissionService } from '@/background/service';
import { SessionEvent, SessionEventPayload } from '@/shared/interfaces/SessionEvent';

export interface SessionInfo {
    origin: string;
    icon: string;
    name: string;
}

export class Session {
    public origin: string = '';
    public icon: string = '';
    public name: string = '';

    public key: number = 0;

    setProp(params: SessionInfo) {
        this.origin = params.origin;
        this.icon = params.icon;
        this.name = params.name;
    }

    pushMessage<T extends SessionEvent>(_ev: T, _data?: SessionEventPayload<T>, _origin?: string) {}
}

// for each tab
const sessionMap = new Map();

const getSession = (id: number) => {
    return sessionMap.get(id);
};

const getOrCreateSession = (id: number) => {
    if (sessionMap.has(id)) {
        return getSession(id);
    }

    return createSession(id);
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
