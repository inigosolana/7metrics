import React, { useState } from 'react';
import { HandballEvent, DefenseType, TurnoverType } from '../types';

interface TacticalEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Partial<HandballEvent>) => void;
    initialAction: string;
}

export const TacticalEntryModal: React.FC<TacticalEntryModalProps> = ({ isOpen, onClose, onSave, initialAction }) => {
    const [step, setStep] = useState<'DETAILS' | 'COURT' | 'GOAL'>(initialAction === 'Goal' || initialAction === 'Missed Shot' ? 'COURT' : 'DETAILS');
    const [event, setEvent] = useState<Partial<HandballEvent>>({
        action: initialAction,
        is_7m: false,
        defenseAtMoment: '6:0',
    });

    const COURT_ZONES = ["Extremo Izq", "Lateral Izq", "Central", "Lateral Der", "Extremo Der", "Pivote", "9m"];
    const GOAL_ZONES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const DEFENSE_TYPES: DefenseType[] = ["6:0", "5:1", "3:2:1", "4:2", "Mixta", "Presión", "Otro"];

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(event);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-[#1a120b] border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            Detalle de Acción: {event.action}
                        </h2>
                        <p className="text-[10px] text-[#cbad90] uppercase font-bold tracking-widest mt-1">Wizard de Registro Técnico</p>
                    </div>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Progress Bar */}
                    <div className="flex gap-2">
                        <div className={`h-1 flex-1 rounded-full ${step === 'DETAILS' || step === 'COURT' || step === 'GOAL' ? 'bg-primary' : 'bg-white/10'}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${step === 'COURT' || step === 'GOAL' ? 'bg-primary' : 'bg-white/10'}`}></div>
                        <div className={`h-1 flex-1 rounded-full ${step === 'GOAL' ? 'bg-primary' : 'bg-white/10'}`}></div>
                    </div>

                    {step === 'DETAILS' && (
                        <div className="space-y-6 animate-slide-in">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-[#cbad90] uppercase mb-3">Defensa Rival</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {DEFENSE_TYPES.map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setEvent({ ...event, defenseAtMoment: d })}
                                                className={`py-2 rounded-lg text-xs font-bold border transition-all ${event.defenseAtMoment === d ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'}`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#cbad90] uppercase mb-3">Contexto</label>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                                        <span className="text-xs text-white/60">¿Es Lanzamiento de 7m?</span>
                                        <button
                                            onClick={() => setEvent({ ...event, is_7m: !event.is_7m })}
                                            className={`w-12 h-6 rounded-full relative transition-colors ${event.is_7m ? 'bg-neon-green' : 'bg-white/10'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${event.is_7m ? 'left-7' : 'left-1'}`}></div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => (initialAction === 'Goal' || initialAction === 'Missed Shot') ? setStep('COURT') : handleSave()}
                                className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform"
                            >
                                {(initialAction === 'Goal' || initialAction === 'Missed Shot') ? 'Siguiente: Zona de Campo' : 'Finalizar Registro'}
                            </button>
                        </div>
                    )}

                    {step === 'COURT' && (
                        <div className="space-y-6 animate-slide-in">
                            <label className="block text-[10px] font-bold text-[#cbad90] uppercase text-center mb-4">¿Desde dónde se realizó el lanzamiento?</label>
                            <div className="relative aspect-[2/1] bg-[#2f2519] rounded-xl overflow-hidden border border-white/10 p-4">
                                {/* Symbolic Court */}
                                <div className="absolute inset-0 border-2 border-white/10 m-4 rounded-t-[100px]"></div>
                                <div className="grid grid-cols-3 h-full gap-2 relative z-10">
                                    {COURT_ZONES.map(zone => (
                                        <button
                                            key={zone}
                                            onClick={() => {
                                                setEvent({ ...event, courtZone: zone });
                                                setStep('GOAL');
                                            }}
                                            className={`flex items-center justify-center rounded-lg border text-[10px] font-bold transition-all ${event.courtZone === zone ? 'bg-primary border-primary text-white' : 'bg-black/40 border-white/10 text-white/40 hover:bg-black/60'}`}
                                        >
                                            {zone}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => setStep('DETAILS')} className="text-xs text-white/40 hover:text-white underline w-full text-center">Volver a detalles</button>
                        </div>
                    )}

                    {step === 'GOAL' && (
                        <div className="space-y-6 animate-slide-in">
                            <label className="block text-[10px] font-bold text-[#cbad90] uppercase text-center mb-4">¿Hacia qué zona de la portería?</label>
                            <div className="max-w-md mx-auto aspect-[3/2] bg-black/40 border-4 border-white/20 rounded-lg p-2 grid grid-cols-3 grid-rows-3 gap-2 relative">
                                {GOAL_ZONES.map(zone => (
                                    <button
                                        key={zone}
                                        onClick={() => {
                                            setEvent({ ...event, goalZone: zone });
                                            handleSave();
                                        }}
                                        className={`flex items-center justify-center rounded border-2 transition-all ${event.goalZone === zone ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'bg-white/5 border-white/5 text-white/20 hover:border-white/20'}`}
                                    >
                                        <span className="text-xl font-black">{zone}</span>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-white/40 px-4">
                                <span>Poste Izquierdo</span>
                                <span>Larguero</span>
                                <span>Poste Derecho</span>
                            </div>
                            <button onClick={() => setStep('COURT')} className="text-xs text-white/40 hover:text-white underline w-full text-center">Volver a zona de campo</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
