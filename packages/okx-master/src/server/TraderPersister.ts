import { DataSource, FindOptionsWhere, Not } from 'typeorm';

import { Trader } from './model';
import { OkxTrader } from './Trader';
import { OkxTraderMaster } from './TraderMaster';

export class OkxTraderPersister {
  private _master: OkxTraderMaster;
  private _dataSource: DataSource;
  private _saveHandler: (traderClass: OkxTrader) => void;
  private _removeHandler: (traderClass: OkxTrader) => void;

  constructor(master: OkxTraderMaster, dataSource: DataSource) {
    this._master = master;
    this._dataSource = dataSource;
    this._saveHandler = (traderClass: OkxTrader) => {
      void this.saveTrader(traderClass);
    };
    this._removeHandler = (traderClass: OkxTrader) => {
      void this.saveTrader(traderClass, 'removed');
    };
  }

  private _subscribe(sub = true) {
    const { _master: master } = this;
    const action = sub ? master.on.bind(master) : master.off.bind(master);
    action('add', this._saveHandler);
    action('start', this._saveHandler);
    action('stop', this._saveHandler);
    action('remove', this._removeHandler);
  }

  private _classToModel(traderClass: OkxTrader): Trader {
    const traderModel = new Trader();
    traderModel.id = traderClass.id;
    traderModel.config = JSON.stringify(traderClass.config);
    traderModel.instId = traderClass.instId || '';
    traderModel.name = traderClass.name;
    traderModel.status = traderClass.status;
    traderModel.boughtPrice = traderClass.boughtPrice;
    traderModel.boughtSize = traderClass.boughtSize;
    traderModel.soldPrice = traderClass.soldPrice;
    traderModel.soldSize = traderClass.soldSize;
    traderModel.tradedPrice = traderClass.tradedPrice;
    traderModel.tradedSize = traderClass.tradedSize;
    traderModel.ts = Date.now();
    traderModel.type = traderClass.type;
    return traderModel;
  }

  public async saveTrader(
    traderClass: OkxTrader,
    status?: TraderStatus
  ): Promise<void> {
    const traderModel = this._classToModel(traderClass);
    if (status) {
      traderModel.status = status;
    }
    await this._dataSource.manager.save(traderModel);
  }

  public async getTraders(instId?: InstId) {
    const { _dataSource } = this;
    const where: FindOptionsWhere<Trader>[] = [
      {
        status: Not('removed' as TraderStatus),
      },
    ];
    if (instId) {
      where.push({
        instId,
      });
    }
    const traderModels = await _dataSource.manager.findBy(Trader, where);
    return traderModels;
  }

  public start(): void {
    this._subscribe(true);
  }

  public stop(): void {
    this._subscribe(false);
  }

  public dispose(): void {
    this._subscribe(false);
  }
}
